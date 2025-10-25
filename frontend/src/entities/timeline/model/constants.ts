import {
  metricsRangeOptions,
  type MetricsRangeOption,
} from "@/shared/lib/metrics-range"

import type { TimelineRangeOption } from "./types"

export const timelineRangeOptions: TimelineRangeOption[] =
  metricsRangeOptions as TimelineRangeOption[]
