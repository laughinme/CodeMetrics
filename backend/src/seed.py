import asyncio
import hashlib
import os
import random
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from sqlalchemy import select, text
from sqlalchemy.orm import selectinload

from core.crypto import hash_password
from database.relational_db.session import async_session
from database.relational_db.tables import (
    Language,
    Permission,
    Role,
    User,
)
from database.relational_db.tables.aggr_commits.interfaces import (
    AggregateMetricsInterface,
    AuthorRepoDayDelta,
    FileRepoDayDelta,
    HourRepoDayDelta,
    SizeBucket,
    SizeBucketDelta,
)
from database.relational_db.tables.authors.authors_interface import AuthorInterface
from database.relational_db.tables.branches.branches_interface import BranchInterface
from database.relational_db.tables.commitfiles.commitfiles_interface import (
    CommitFileInterface,
    CommitFilePayload,
)
from database.relational_db.tables.commits.commits_interface import CommitInterface
from database.relational_db.tables.projects.projects_interface import ProjectInterface
from database.relational_db.tables.repositories.repositories_interface import RepositoryInterface
from database.relational_db.tables.users.users_table_interface import UserInterface
from domain.auth.enums.permissions import ADMIN_PERMISSIONS, SystemPermission
from domain.auth.enums.roles import SystemRole
from domain.parsing.schemas import BranchModel, CommitModel, GitUser, ProjectModel, RepositoryModel

SEED_VERSION = "2026-02-03"
SHORT_MESSAGE_THRESHOLD = 50
BINARY_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".ico"}


@dataclass(frozen=True)
class RepoSpec:
    key: str
    description: str
    topics: list[str]
    default_branch: str
    activity: str
    branches: list[str]
    files: list[tuple[str, int]]
    night_owl: bool = False


@dataclass(frozen=True)
class ProjectSpec:
    name: str
    full_name: str
    description: str
    is_public: bool
    is_favorite: bool
    repos: list[RepoSpec]


PROJECT_SPECS: list[ProjectSpec] = [
    ProjectSpec(
        name="CORE",
        full_name="Core Platform",
        description="Core services and platform components for CodeMetrics.",
        is_public=False,
        is_favorite=True,
        repos=[
            RepoSpec(
                key="api-gateway",
                description="API gateway, auth, and request routing.",
                topics=["fastapi", "gateway", "auth", "observability"],
                default_branch="main",
                activity="high",
                branches=["main", "develop", "feature/observability", "release/1.4", "hotfix/login"],
                files=[
                    ("src/api/routes.py", 5),
                    ("src/api/middlewares.py", 4),
                    ("src/core/config.py", 3),
                    ("src/core/security.py", 4),
                    ("src/service/auth.py", 4),
                    ("src/service/tokens.py", 3),
                    ("src/metrics/kpi.py", 2),
                    ("tests/test_auth.py", 2),
                    ("README.md", 1),
                    ("Dockerfile", 1),
                ],
            ),
            RepoSpec(
                key="ingest-service",
                description="Data ingest pipeline and event processing.",
                topics=["ingest", "kafka", "async", "etl"],
                default_branch="main",
                activity="medium",
                branches=["main", "develop", "feature/batch-mode", "release/0.9"],
                files=[
                    ("src/ingest/consumer.py", 5),
                    ("src/ingest/pipeline.py", 4),
                    ("src/ingest/validators.py", 3),
                    ("src/storage/postgres.py", 3),
                    ("src/storage/s3.py", 2),
                    ("src/cli.py", 2),
                    ("README.md", 1),
                    ("docker-compose.yml", 1),
                ],
            ),
        ],
    ),
    ProjectSpec(
        name="ANALYTICS",
        full_name="Analytics Suite",
        description="Metrics, reports, and ML models for activity analytics.",
        is_public=False,
        is_favorite=False,
        repos=[
            RepoSpec(
                key="metrics-engine",
                description="KPI and aggregate computation for commits and authors.",
                topics=["analytics", "metrics", "sql", "etl"],
                default_branch="main",
                activity="high",
                branches=["main", "develop", "feature/anomaly", "release/2.1"],
                files=[
                    ("src/engine/aggregations.py", 5),
                    ("src/engine/scoring.py", 4),
                    ("src/engine/quality.py", 4),
                    ("src/engine/reports.py", 3),
                    ("src/models/buckets.py", 3),
                    ("sql/views/metrics.sql", 2),
                    ("sql/views/authors.sql", 2),
                    ("README.md", 1),
                ],
            ),
            RepoSpec(
                key="dashboards",
                description="Charts, widgets, and metrics visualization.",
                topics=["frontend", "charts", "react", "ui"],
                default_branch="main",
                activity="medium",
                branches=["main", "develop", "feature/heatmap", "release/1.2"],
                files=[
                    ("src/components/Dashboard.tsx", 5),
                    ("src/components/Charts/Heatmap.tsx", 4),
                    ("src/components/Charts/Histogram.tsx", 3),
                    ("src/hooks/useMetrics.ts", 4),
                    ("src/styles/theme.css", 3),
                    ("src/pages/Overview.tsx", 2),
                    ("public/index.html", 1),
                ],
            ),
        ],
    ),
    ProjectSpec(
        name="CLIENT",
        full_name="Client Apps",
        description="Web and mobile clients for metrics.",
        is_public=True,
        is_favorite=False,
        repos=[
            RepoSpec(
                key="web-app",
                description="Primary CodeMetrics web interface.",
                topics=["web", "vite", "typescript", "ui"],
                default_branch="main",
                activity="high",
                branches=["main", "develop", "feature/insights", "release/3.0"],
                files=[
                    ("src/pages/Dashboard.tsx", 5),
                    ("src/pages/Developers.tsx", 4),
                    ("src/pages/Insights.tsx", 4),
                    ("src/components/Sidebar.tsx", 3),
                    ("src/components/CommitFeed.tsx", 3),
                    ("src/styles/app.css", 2),
                    ("src/api/client.ts", 3),
                    ("vite.config.ts", 1),
                ],
            ),
            RepoSpec(
                key="mobile-sdk",
                description="SDK for mobile clients and integrations.",
                topics=["sdk", "android", "ios", "kotlin"],
                default_branch="main",
                activity="low",
                branches=["main", "develop", "feature/offline-cache"],
                files=[
                    ("android/src/main/java/com/codemetrics/Client.kt", 4),
                    ("android/src/main/java/com/codemetrics/Auth.kt", 3),
                    ("ios/Sources/Client.swift", 4),
                    ("ios/Sources/TokenStore.swift", 3),
                    ("docs/usage.md", 2),
                    ("README.md", 1),
                    ("assets/logo.png", 1),
                ],
                night_owl=True,
            ),
        ],
    ),
]

ACTIVITY_TARGETS = {
    "high": 90,
    "medium": 60,
    "low": 35,
}

SHORT_MESSAGES = [
    "Fix typo in docs",
    "Refactor utils",
    "Update dependencies",
    "Cleanup lints",
    "Tune configs",
    "Improve logging",
    "Align API response",
    "Adjust styles",
]

LONG_TEMPLATES = [
    "Add {feature} for {component} to improve {goal}",
    "Implement {feature} pipeline in {component}",
    "Optimize {component} for {goal}",
    "Introduce {feature} and update {component}",
    "Rework {component} to support {goal}",
    "Wire {feature} into {component} with extra telemetry",
]

FEATURES = [
    "cache warmup",
    "commit feed",
    "heatmap view",
    "insight scoring",
    "auth refresh",
    "batch upload",
    "metrics export",
    "usage alerts",
    "trend detection",
]

COMPONENTS = [
    "API gateway",
    "metrics engine",
    "dashboard",
    "ingest pipeline",
    "auth service",
    "frontend shell",
    "SDK layer",
    "report builder",
]

GOALS = [
    "faster load times",
    "higher reliability",
    "better observability",
    "lower latency",
    "cleaner UX",
    "more accurate KPI",
]


def _weighted_choice(rand: random.Random, items: list[str], weights: list[int]) -> str:
    return rand.choices(items, weights=weights, k=1)[0]


def _is_binary(path: str) -> bool:
    lower = path.lower()
    return any(lower.endswith(ext) for ext in BINARY_EXTS)


def _make_sha(repo_key: str, timestamp: datetime, index: int) -> str:
    raw = f"{repo_key}-{timestamp.isoformat()}-{index}".encode("utf-8")
    return hashlib.sha1(raw).hexdigest()


def _make_message(rand: random.Random, project_key: str) -> tuple[str, dict[str, str]]:
    issue_payload: dict[str, str] = {}
    if rand.random() < 0.35:
        msg = rand.choice(SHORT_MESSAGES)
    else:
        msg = rand.choice(LONG_TEMPLATES).format(
            feature=rand.choice(FEATURES),
            component=rand.choice(COMPONENTS),
            goal=rand.choice(GOALS),
        )

    if rand.random() < 0.45:
        issue_key = f"{project_key}-{rand.randint(12, 980)}"
        issue_payload = {issue_key: msg}
        msg = f"{issue_key} {msg}"

    return msg, issue_payload


def _choose_churn(rand: random.Random) -> int:
    bucket = rand.choices(
        [SizeBucket.ZERO_TEN, SizeBucket.ELEVEN_FIFTY, SizeBucket.FIFTY_ONE_HUNDRED, SizeBucket.HUNDRED_PLUS],
        weights=[55, 25, 15, 5],
        k=1,
    )[0]

    if bucket == SizeBucket.ZERO_TEN:
        return rand.randint(1, 10)
    if bucket == SizeBucket.ELEVEN_FIFTY:
        return rand.randint(11, 50)
    if bucket == SizeBucket.FIFTY_ONE_HUNDRED:
        return rand.randint(51, 100)
    return rand.randint(101, 180)


def _split_churn(rand: random.Random, churn: int, files_count: int) -> list[int]:
    remaining = churn
    splits: list[int] = []
    for idx in range(files_count):
        if idx == files_count - 1:
            splits.append(remaining)
        else:
            max_take = max(1, remaining - (files_count - idx - 1))
            take = rand.randint(1, max_take)
            splits.append(take)
            remaining -= take
    return splits


def _build_patch(path: str, added: int, deleted: int) -> str:
    header = f"diff --git a/{path} b/{path}"
    hunk = f"@@ -1,{max(deleted, 1)} +1,{max(added, 1)} @@"
    body = "\n".join([
        *("- line" for _ in range(min(deleted, 3))),
        *("+ line" for _ in range(min(added, 3))),
    ])
    return f"{header}\n{hunk}\n{body}".strip()


def _hour_weights(night_owl: bool) -> list[int]:
    weights: list[int] = []
    for hour in range(24):
        if 9 <= hour <= 18:
            base = 6
        elif 19 <= hour <= 22:
            base = 3
        else:
            base = 1

        if night_owl and (hour <= 7 or hour >= 21):
            base += 2
        weights.append(base)
    return weights


def _sample_timestamps(
    rand: random.Random,
    count: int,
    start_day: date,
    end_day: date,
    *,
    night_owl: bool,
) -> list[datetime]:
    days = [start_day + timedelta(days=i) for i in range((end_day - start_day).days + 1)]
    day_weights = [4 if day.weekday() < 5 else 2 for day in days]
    hours = list(range(24))
    hour_weights = _hour_weights(night_owl)

    timestamps: list[datetime] = []
    for _ in range(count):
        day = rand.choices(days, weights=day_weights, k=1)[0]
        hour = rand.choices(hours, weights=hour_weights, k=1)[0]
        minute = rand.randint(0, 59)
        second = rand.randint(0, 59)
        timestamps.append(datetime.combine(day, time(hour, minute, second), tzinfo=UTC))

    timestamps.sort()
    return timestamps


def _select_files(
    rand: random.Random,
    files: list[tuple[str, int]],
    count: int,
) -> list[str]:
    pool = [path for path, _ in files]
    weights = [weight for _, weight in files]
    selected: set[str] = set()
    while len(selected) < count:
        selected.add(_weighted_choice(rand, pool, weights))
    return list(selected)


def _bucket_for_churn(churn: int) -> SizeBucket:
    if churn <= 10:
        return SizeBucket.ZERO_TEN
    if churn <= 50:
        return SizeBucket.ELEVEN_FIFTY
    if churn <= 100:
        return SizeBucket.FIFTY_ONE_HUNDRED
    return SizeBucket.HUNDRED_PLUS


def _seed_languages() -> list[Language]:
    return [
        Language(code="en", name_ru="English", name_en="English"),
        Language(code="ru", name_ru="Russian", name_en="Russian"),
        Language(code="es", name_ru="Spanish", name_en="Spanish"),
        Language(code="de", name_ru="German", name_en="German"),
    ]


def _seed_permissions() -> dict[str, Permission]:
    perms: dict[str, Permission] = {}
    for perm in SystemPermission:
        perms[perm.value] = Permission(
            slug=perm.value,
            name=perm.value.replace(".", " ").title(),
            description=f"System permission: {perm.value}",
        )
    return perms


def _seed_roles(permission_map: dict[str, Permission]) -> list[Role]:
    admin_role = Role(
        slug=SystemRole.ADMIN.value,
        name="Administrator",
        description="Full access to system administration.",
    )
    admin_role.permissions = [permission_map[perm.value] for perm in ADMIN_PERMISSIONS]

    member_role = Role(
        slug=SystemRole.MEMBER.value,
        name="Member",
        description="Default member role.",
    )
    member_role.permissions = []

    return [admin_role, member_role]


def _seed_users() -> list[dict[str, str]]:
    return [
        {
            "email": "admin@codemetrics.local",
            "password": os.getenv("SEED_ADMIN_PASSWORD", "admin12345"),
            "username": "admin",
            "role": SystemRole.ADMIN.value,
            "language_code": "ru",
        },
        {
            "email": "demo@codemetrics.local",
            "password": os.getenv("SEED_DEMO_PASSWORD", "demo12345"),
            "username": "demo",
            "role": SystemRole.MEMBER.value,
            "language_code": "en",
        },
        {
            "email": "analyst@codemetrics.local",
            "password": os.getenv("SEED_ANALYST_PASSWORD", "metrics123"),
            "username": "analyst",
            "role": SystemRole.MEMBER.value,
            "language_code": "en",
        },
    ]


async def seed_database() -> None:
    force = os.getenv("SEED_FORCE", "").lower() in {"1", "true", "yes"}
    disable = os.getenv("SEED_DISABLE", "").lower() in {"1", "true", "yes"}

    if disable:
        print("[seed] disabled via SEED_DISABLE")
        return

    async with async_session() as session:
        result = await session.execute(text("SELECT 1 FROM projects LIMIT 1"))
        if result.first() and not force:
            print("[seed] data already exists, skipping")
            return

        if force:
            await session.execute(
                text(
                    "TRUNCATE TABLE "
                    "role_permissions, user_roles, permissions, roles, users, languages, "
                    "commit_files, commits, branches, repositories, projects, authors, "
                    "agg_author_repo_day, agg_hour_repo_day, agg_size_bucket_repo_day, agg_file_repo_day "
                    "RESTART IDENTITY CASCADE"
                )
            )
            await session.commit()

        print(f"[seed] seeding data (version {SEED_VERSION})...")

        # Seed languages
        existing_langs = set(
            (await session.scalars(select(Language.code))).all()
        )
        languages = [lang for lang in _seed_languages() if lang.code not in existing_langs]
        if languages:
            session.add_all(languages)

        # Seed permissions (idempotent)
        perm_slugs = [perm.value for perm in SystemPermission]
        existing_perms = await session.scalars(
            select(Permission).where(Permission.slug.in_(perm_slugs))
        )
        permission_map: dict[str, Permission] = {
            perm.slug: perm for perm in existing_perms
        }
        new_permissions: list[Permission] = []
        for perm in SystemPermission:
            if perm.value in permission_map:
                continue
            perm_obj = Permission(
                slug=perm.value,
                name=perm.value.replace(".", " ").title(),
                description=f"System permission: {perm.value}",
            )
            permission_map[perm.value] = perm_obj
            new_permissions.append(perm_obj)
        if new_permissions:
            session.add_all(new_permissions)

        # Seed roles (idempotent)
        role_slugs = [SystemRole.ADMIN.value, SystemRole.MEMBER.value]
        existing_roles = await session.scalars(
            select(Role)
            .where(Role.slug.in_(role_slugs))
            .options(selectinload(Role.permissions))
        )
        role_lookup: dict[str, Role] = {role.slug: role for role in existing_roles}

        new_roles: list[Role] = []
        admin_role = role_lookup.get(SystemRole.ADMIN.value)
        if admin_role is None:
            admin_role = Role(
                slug=SystemRole.ADMIN.value,
                name="Administrator",
                description="Full access to system administration.",
            )
            role_lookup[SystemRole.ADMIN.value] = admin_role
            new_roles.append(admin_role)

        member_role = role_lookup.get(SystemRole.MEMBER.value)
        if member_role is None:
            member_role = Role(
                slug=SystemRole.MEMBER.value,
                name="Member",
                description="Default member role.",
            )
            role_lookup[SystemRole.MEMBER.value] = member_role
            new_roles.append(member_role)

        admin_perm_objs = [
            permission_map[perm.value]
            for perm in ADMIN_PERMISSIONS
            if perm.value in permission_map
        ]
        if admin_role.permissions:
            existing_perm_slugs = {perm.slug for perm in admin_role.permissions}
            for perm in admin_perm_objs:
                if perm.slug not in existing_perm_slugs:
                    admin_role.permissions.append(perm)
        else:
            admin_role.permissions = admin_perm_objs

        if new_roles:
            session.add_all(new_roles)

        await session.flush()

        # Seed users
        user_repo = UserInterface(session)
        now = datetime.now(UTC)
        for payload in _seed_users():
            existing_user = await user_repo.get_by_email(payload["email"])
            if existing_user is not None and not force:
                continue

            password_hash = await hash_password(payload["password"])
            if existing_user is None:
                user = User(
                    email=payload["email"],
                    password_hash=password_hash,
                    confirmed_at=now,
                    username=payload["username"],
                    is_onboarded=True,
                    language_code=payload["language_code"],
                    bio="CodeMetrics team",
                    profile_pic_url="https://placehold.co/128x128",
                )
                await user_repo.add(user)
            else:
                user = existing_user
                user.password_hash = password_hash
                user.confirmed_at = now
                user.username = payload["username"]
                user.is_onboarded = True
                user.language_code = payload["language_code"]
                user.bio = "CodeMetrics team"
                user.profile_pic_url = "https://placehold.co/128x128"

            role = role_lookup.get(payload["role"])
            if role:
                await user_repo.assign_roles(user, [role])

        # Seed authors
        author_repo = AuthorInterface(session)
        author_specs = [
            ("Alexey Danilov", "alex@codemetrics.dev", 9),
            ("Nadia Smirnova", "nadia@codemetrics.dev", 7),
            ("Maria Ilyina", "maria@codemetrics.dev", 6),
            ("Ivan Petrov", "ivan@codemetrics.dev", 6),
            ("Dmitry Volkov", "d.volkov@codemetrics.dev", 5),
            ("Elena Park", "elena.park@codemetrics.dev", 4),
            ("Ravi Kumar", "ravi@codemetrics.dev", 3),
            ("Chen Li", "chen.li@codemetrics.dev", 2),
        ]
        authors: list[tuple[GitUser, int]] = [
            (GitUser(name=name, email=email), weight)
            for name, email, weight in author_specs
        ]
        author_objects = {}
        for author, _weight in authors:
            author_obj = await author_repo.get_or_create(author)
            if author_obj is not None:
                author_objects[author.email] = author_obj

        project_repo = ProjectInterface(session)
        repository_repo = RepositoryInterface(session)
        branch_repo = BranchInterface(session)
        commit_repo = CommitInterface(session)
        commit_files_repo = CommitFileInterface(session)
        aggregates = AggregateMetricsInterface(session)

        author_deltas: list[AuthorRepoDayDelta] = []
        hour_deltas: list[HourRepoDayDelta] = []
        size_deltas: list[SizeBucketDelta] = []
        file_deltas: list[FileRepoDayDelta] = []

        start_day = date.today() - timedelta(days=120)
        end_day = date.today()

        for project_index, project_spec in enumerate(PROJECT_SPECS, start=1):
            project_model = ProjectModel(
                id=project_index,
                name=project_spec.name,
                full_name=project_spec.full_name,
                description=project_spec.description,
                is_public=project_spec.is_public,
                lfs_allow=False,
                is_favorite=project_spec.is_favorite,
                parent_id=None,
                permissions={"read": True, "write": True, "admin": project_spec.is_favorite},
                created_at=datetime.now(UTC) - timedelta(days=220 - project_index * 10),
                updated_at=datetime.now(UTC) - timedelta(days=5),
            )
            project = await project_repo.upsert_from_model(project_model)
            await session.flush()

            for repo_index, repo_spec in enumerate(project_spec.repos, start=1):
                repo_model = RepositoryModel(
                    name=repo_spec.key,
                    owner_name=project_spec.name,
                    description=repo_spec.description,
                    default_branch=repo_spec.default_branch,
                    topics=repo_spec.topics,
                    permissions={"read": True, "write": True, "admin": project_spec.is_favorite},
                    created_at=datetime.now(UTC) - timedelta(days=200 - repo_index * 7),
                    updated_at=datetime.now(UTC) - timedelta(days=3),
                )
                repository = await repository_repo.upsert_from_model(project, repo_model)
                await session.flush()

                branch_models = [
                    BranchModel(name=branch, is_protected=branch.startswith("release"), is_default=branch == repo_spec.default_branch)
                    for branch in repo_spec.branches
                ]
                await branch_repo.sync_from_models(repository, branch_models)

                # Generate commits
                seed_raw = f"{project_spec.name}:{repo_spec.key}".encode("utf-8")
                seed_value = int(hashlib.sha1(seed_raw).hexdigest(), 16) % (2**32)
                repo_rand = random.Random(seed_value)
                target = ACTIVITY_TARGETS.get(repo_spec.activity, 40)
                timestamps = _sample_timestamps(
                    repo_rand,
                    target,
                    start_day,
                    end_day,
                    night_owl=repo_spec.night_owl,
                )

                commit_shas: list[str] = []
                latest_commit_ts = None

                for idx, ts in enumerate(timestamps):
                    sha = _make_sha(repo_spec.key, ts, idx)
                    parents: list[str] = []
                    if commit_shas:
                        parents = [commit_shas[-1]]
                        if repo_rand.random() < 0.08 and len(commit_shas) > 4:
                            parents.append(repo_rand.choice(commit_shas[:-1]))

                    message, issues = _make_message(repo_rand, project_spec.name)

                    author_user, _ = repo_rand.choices(authors, weights=[w for _, w in authors], k=1)[0]
                    committer_user = author_user
                    if repo_rand.random() < 0.15:
                        committer_user, _ = repo_rand.choices(authors, weights=[w for _, w in authors], k=1)[0]

                    author = author_objects.get(author_user.email)
                    committer = author_objects.get(committer_user.email)
                    if author:
                        await author_repo.touch_commit_window(author, ts)
                    if committer:
                        await author_repo.touch_commit_window(committer, ts)

                    branch_names = [repo_spec.default_branch]
                    if repo_rand.random() < 0.3 and len(repo_spec.branches) > 1:
                        branch_names.append(repo_rand.choice(repo_spec.branches[1:]))

                    tag_names: list[str] = []
                    old_tags: list[str] = []
                    if idx % 25 == 0 and idx > 0:
                        tag = f"v{project_index}.{repo_index}.{idx // 25}"
                        tag_names.append(tag)
                        old_tags.append(tag)

                    commit_model = CommitModel(
                        sha=sha,
                        author=author_user,
                        committer=committer_user,
                        created_at=ts,
                        message=message,
                        issues=issues,
                        parents=parents,
                        branch_names=branch_names,
                        tag_names=tag_names,
                        old_tags=old_tags,
                    )

                    commit, created = await commit_repo.upsert_from_model(
                        repository,
                        commit_model,
                        author,
                        committer,
                    )

                    churn = _choose_churn(repo_rand)
                    if churn <= 10:
                        files_count = repo_rand.randint(1, 2)
                    elif churn <= 50:
                        files_count = repo_rand.randint(1, 3)
                    elif churn <= 100:
                        files_count = repo_rand.randint(2, 4)
                    else:
                        files_count = repo_rand.randint(3, 6)

                    file_paths = _select_files(repo_rand, repo_spec.files, files_count)
                    file_churns = _split_churn(repo_rand, churn, len(file_paths))

                    files_payload: list[CommitFilePayload] = []
                    patches: list[str] = []
                    total_added = 0
                    total_deleted = 0

                    for path, file_churn in zip(file_paths, file_churns):
                        added = repo_rand.randint(0, file_churn)
                        deleted = file_churn - added
                        total_added += added
                        total_deleted += deleted
                        status = "modified"
                        if added > 0 and deleted == 0:
                            status = "added"
                        elif deleted > 0 and added == 0:
                            status = "deleted"

                        binary_flag = _is_binary(path)
                        patch = None if binary_flag else _build_patch(path, added, deleted)
                        if patch:
                            patches.append(patch)

                        files_payload.append(
                            CommitFilePayload(
                                path=path,
                                status=status,
                                added_lines=added,
                                deleted_lines=deleted,
                                patch=patch or "",
                                is_binary=binary_flag,
                            )
                        )

                    diff_content = "\n\n".join(patches)

                    await commit_files_repo.replace_for_commit(sha, files_payload)
                    await commit_repo.apply_diff_stats(
                        commit,
                        diff_content=diff_content,
                        added_lines=total_added,
                        deleted_lines=total_deleted,
                        files_changed=len(files_payload),
                    )

                    if created:
                        day = ts.astimezone(UTC).date()
                        hour = ts.astimezone(UTC).hour
                        message_len = len(message or "")
                        short_flag = 1 if message_len < SHORT_MESSAGE_THRESHOLD else 0
                        files_changed = len(files_payload)
                        churn_total = total_added + total_deleted

                        author_id = author.id if author else committer.id if committer else None
                        if author_id is not None:
                            author_deltas.append(
                                AuthorRepoDayDelta(
                                    day=day,
                                    project_id=repository.project_id,
                                    repo_id=repository.id,
                                    author_id=author_id,
                                    commits=1,
                                    lines_added=total_added,
                                    lines_deleted=total_deleted,
                                    files_changed=files_changed,
                                    msg_total_len=message_len,
                                    msg_short_count=short_flag,
                                )
                            )

                        hour_deltas.append(
                            HourRepoDayDelta(
                                day=day,
                                project_id=repository.project_id,
                                repo_id=repository.id,
                                hour=hour,
                                commits=1,
                                lines_added=total_added,
                                lines_deleted=total_deleted,
                            )
                        )

                        size_deltas.append(
                            SizeBucketDelta(
                                day=day,
                                project_id=repository.project_id,
                                repo_id=repository.id,
                                bucket=_bucket_for_churn(churn_total),
                                cnt=1,
                            )
                        )

                        for file_payload in files_payload:
                            file_deltas.append(
                                FileRepoDayDelta(
                                    day=day,
                                    project_id=repository.project_id,
                                    repo_id=repository.id,
                                    path=file_payload.path,
                                    commits_touch=1,
                                    lines_added=file_payload.added_lines,
                                    lines_deleted=file_payload.deleted_lines,
                                    churn=file_payload.added_lines + file_payload.deleted_lines,
                                )
                            )

                    commit_shas.append(sha)
                    latest_commit_ts = ts

                if latest_commit_ts:
                    repository.updated_at = latest_commit_ts

        await session.flush()

        if author_deltas:
            await aggregates.upsert_author_repo_day(author_deltas)
        if hour_deltas:
            await aggregates.upsert_hour_repo_day(hour_deltas)
        if size_deltas:
            await aggregates.upsert_size_buckets(size_deltas)
        if file_deltas:
            await aggregates.upsert_hot_files(file_deltas)

        await session.commit()

        print("[seed] done")


if __name__ == "__main__":
    asyncio.run(seed_database())
