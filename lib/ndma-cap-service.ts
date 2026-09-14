/**
 * NDMA / IMD Common Alerting Protocol (CAP v1.2) Ingestion Service
 * Ingests disaster alerts from National Disaster Management Authority (NDMA SACHET)
 * and WMO WIS 2.0 MQTT edge feeds into the PostgreSQL PostGIS database.
 */

import { getPgPool } from "./db";

export interface NdmaCapAlertPayload {
  identifier: string;
  sender: string;
  sentAt: string;
  status: "Actual" | "Exercise" | "Test";
  msgType: "Alert" | "Update" | "Cancel";
  scope: "Public" | "Restricted";
  event: string;
  urgency: "Immediate" | "Expected" | "Future";
  severity: "Extreme" | "Severe" | "Moderate" | "Minor";
  certainty: "Observed" | "Likely" | "Possible";
  headline: string;
  description: string;
  instruction?: string;
  areaDesc: string;
  polygonCoordinates: Array<[number, number]>; // [[lng, lat], ...]
  expiresAt: string;
}

export class NdmaCapAlertService {
  /**
   * Ingests a CAP 1.2 disaster alert payload and persists to PostgreSQL with PostGIS geometry.
   */
  public static async ingestCapAlert(alert: NdmaCapAlertPayload): Promise<boolean> {
    const pool = getPgPool();

    // Construct WKT Polygon: POLYGON((lng1 lat1, lng2 lat2, ...))
    const coordsStr = alert.polygonCoordinates
      .map(([lng, lat]) => `${lng} ${lat}`)
      .join(", ");
    const wktPolygon = `POLYGON((${coordsStr}))`;

    if (pool) {
      try {
        const sql = `
          INSERT INTO "CAP_Alerts" (
            "identifier", "sender", "sentAt", "status", "msgType", "scope",
            "event", "urgency", "severity", "certainty", "headline",
            "description", "instruction", "areaDesc", "geom", "expiresAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            ST_GeomFromText($15, 4326), $16, NOW()
          )
          ON CONFLICT ("identifier") DO UPDATE SET
            "event" = EXCLUDED."event",
            "severity" = EXCLUDED."severity",
            "headline" = EXCLUDED."headline",
            "description" = EXCLUDED."description",
            "instruction" = EXCLUDED."instruction",
            "geom" = EXCLUDED."geom",
            "expiresAt" = EXCLUDED."expiresAt",
            "updatedAt" = NOW();
        `;

        await pool.query(sql, [
          alert.identifier,
          alert.sender,
          alert.sentAt,
          alert.status,
          alert.msgType,
          alert.scope,
          alert.event,
          alert.urgency,
          alert.severity,
          alert.certainty,
          alert.headline,
          alert.description,
          alert.instruction || null,
          alert.areaDesc,
          wktPolygon,
          alert.expiresAt,
        ]);

        console.log(`[NDMA CAP] Ingested alert ${alert.identifier} (${alert.event})`);
        return true;
      } catch (error) {
        console.warn(`[NDMA CAP] Database write failed for alert ${alert.identifier}`, error);
      }
    }

    return false;
  }

  /**
   * Ingests synthetic real-time NDMA test feeds for major agricultural hubs.
   */
  public static async ingestSampleNdmaFeeds(): Promise<number> {
    const alerts: NdmaCapAlertPayload[] = [
      {
        identifier: "URN:IN-MD:DISASTER:2026:VAR-089",
        sender: "dwr.varanasi@imd.gov.in",
        sentAt: new Date().toISOString(),
        status: "Actual",
        msgType: "Alert",
        scope: "Public",
        event: "Severe Squall / Cloudburst Hazard",
        urgency: "Immediate",
        severity: "Severe",
        certainty: "Observed",
        headline: "S-Band Doppler Radar Alert: 65 km/h squall active in Varanasi-Chandauli agro-corridor.",
        description: "Doppler Radar Reflectivity dBZ > 54 observed at 3.2km altitude. Heavy squall with 42mm localized downburst expected.",
        instruction: "Cease all pesticide/fertilizer spraying immediately. Protect harvested grain in covered warehouses.",
        areaDesc: "Varanasi - Chandauli - Ghazipur Agro-Climatic Zone",
        polygonCoordinates: [
          [82.80, 25.20],
          [83.20, 25.20],
          [83.20, 25.50],
          [82.80, 25.50],
          [82.80, 25.20],
        ],
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      },
      {
        identifier: "URN:IN-MD:DISASTER:2026:PUN-014",
        sender: "imd.pune@imd.gov.in",
        sentAt: new Date().toISOString(),
        status: "Actual",
        msgType: "Alert",
        scope: "Public",
        event: "Heatwave & Unseasonal Gust Advisory",
        urgency: "Expected",
        severity: "Moderate",
        certainty: "Likely",
        headline: "High Evapotranspiration Alert: Day temperatures exceeding 39°C with dry gusty winds in Pune-Shirur belt.",
        description: "Soil moisture depletion rate elevated by 28%. Maintain micro-sprinkler irrigation in early morning hours.",
        instruction: "Irrigate orchards during night/dawn. Postpone herbicide sprays to avoid crop phytotoxicity.",
        areaDesc: "Pune - Haveli - Shirur Agro-Climatic Zone",
        polygonCoordinates: [
          [73.70, 18.40],
          [74.10, 18.40],
          [74.10, 18.70],
          [73.70, 18.70],
          [73.70, 18.40],
        ],
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      },
    ];

    let ingested = 0;
    for (const a of alerts) {
      const ok = await this.ingestCapAlert(a);
      if (ok) ingested++;
    }
    return ingested;
  }
}
