export const SupervisorsPatientIdsSQL = `
(
  SELECT 
    "user"."id"        AS "id"
  FROM 
    "users" "user" 
  INNER JOIN 
    "patient_supervision_mapping" "patient_mapping"
      ON (
        "patient_mapping"."patient_id" = "user"."id" 
        AND 
        "patient_mapping"."user_id" = $1
        AND 
        "patient_mapping"."deleted_at" IS NULL
      )
  WHERE
    "user"."deleted_at" IS NULL
)
`;
