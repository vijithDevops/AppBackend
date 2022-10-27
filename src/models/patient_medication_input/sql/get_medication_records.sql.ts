import { IMedicationRecordsPaginateOptions } from '../interfaces';

export const MedicationRecordsPaginateSQL = (
  options: IMedicationRecordsPaginateOptions,
) => {
  const sql = `
      SELECT
      "patient_input"."id"                      AS "id",
      "patient_input"."dosage"                  AS "dosage",
      "patient_input"."notes"                   AS "notes",
      "patient_input"."created_at"              AS "createdAt",
      "patient_input"."updated_at"              AS "updatedAt",
      "calendar"."date"                         AS "date",
      "calendar"."day"                          AS "day",
      "calendar"."month"                        AS "month",
      "calendar"."year"                         AS "year"
    FROM 
      "patient_medication_input" "patient_input"
    INNER JOIN 
      "calendar" "calendar"
        ON (
          "patient_input"."calendar_id" = "calendar"."id" 
        )
    WHERE (
      "patient_input"."medication_prescription_id" = $1
      AND
      "patient_input"."deleted_at" IS NULL
    )
    ORDER BY "date" ASC
  `;
  return {
    listQuery: `
      ${sql}
      LIMIT ${options.limit}
      OFFSET ${options.skip}
    `,
    countQuery: `
      SELECT COUNT(*)  
      FROM 
        (${sql})
      AS "unionCount"
    `,
  };
};
