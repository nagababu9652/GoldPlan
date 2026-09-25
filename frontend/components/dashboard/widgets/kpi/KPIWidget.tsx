"use client";

import { Widget, WidgetBody } from "../base";

import {
  KPIIcon,
  KPIValue,
  KPITrend,
  KPISparkline,
  KPIFooter,
  KPILoading,
} from ".";

import { KPIWidgetProps } from "./types";

export default function KPIWidget({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color,
  loading,
  sparkline,
  footer,
  onClick,
}: KPIWidgetProps) {
  if (loading) {
    return <KPILoading />;
  }

  return (
    <Widget
      className="cursor-pointer p-6"
      onClick={onClick}
    >
      <WidgetBody>

        <div className="flex items-start justify-between">

          <div>

            <p className="text-sm text-muted-foreground">
              {title}
            </p>

            <KPIValue value={value} />

          </div>

          <KPIIcon
            icon={icon}
            color={color}
          />

        </div>

        <KPITrend
          trend={trend}
          label={trendLabel}
        />

        <KPISparkline
          data={sparkline}
        />

        {footer && (
          <KPIFooter>
            {footer}
          </KPIFooter>
        )}

      </WidgetBody>

    </Widget>
  );
}