export const AppointmentUserIdsSQL = (appointemntId: string) => {
  return `
  (
    SELECT 
      "user"."id"        AS "id"
    FROM 
      "users" "user" 
    INNER JOIN 
      "appointment_users" "appointments"
        ON (
          "appointments"."user_id" = "user"."id" 
          AND 
          "appointments"."appointment_id" = '${appointemntId}'
          AND 
          "appointments"."deleted_at" IS NULL
        )
    WHERE
      "user"."deleted_at" IS NULL
  )
  `;
};
