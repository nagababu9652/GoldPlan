"use client";

import Widget from "../base/Widget";
import WidgetBody from "../base/WidgetBody";

import KPIIcon from "./KPIIcon";
import KPIValue from "./KPIValue";
import KPITrend from "./KPITrend";
import KPISparkline from "./KPISparkline";
import KPIFooter from "./KPIFooter";
import KPILoading from "./KPILoading";

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