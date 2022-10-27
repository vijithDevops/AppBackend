import { IChatUsersPaginateOptions } from '../interfaces';
import { SupervisorsPatientIdsSQL } from './get_supervisors_patient_ids.sql';

export const ChatUserListPaginateSQL = (options: IChatUsersPaginateOptions) => {
  const sql = `
    (
      (
        SELECT
          "patient"."id"                      AS "id",
          "patient"."first_name"              AS "firstName",
          "patient"."middle_name"             AS "middleName",
          "patient"."last_name"               AS "lastName",
          "patient"."username"                AS "username",
          "patient"."role"                    AS "role",
          "patient"."gender"                  AS "gender",
          "patient"."profile_pic"             AS "profilePic",
          "patient"."profile_pic_thumbnail"   AS "profilePicThumbnail",
          "patient"."chat_id"                 AS "chatId",
          "patient"."organization_id"         AS "organizationId",
          "patient_mapping"."is_incharge"     AS "isIncharge",
          "patient_mapping"."user_id"         AS "supervisorId",
          "patient_mapping"."patient_id"      AS "patientId",
          "patient"."first_name"              AS "patientFirstName",
          "patient"."middle_name"             AS "patientMiddleName",
          "patient"."last_name"               AS "patientLastName",
          "patient"."username"                AS "patientUsername"
        FROM 
          "users" "patient"
        INNER JOIN 
          "patient_supervision_mapping" "patient_mapping"
            ON (
              "patient_mapping"."patient_id" = "patient"."id" 
              AND 
              "patient_mapping"."user_id" = $1
              AND
              "patient_mapping"."deleted_at" IS NULL
            )
        WHERE (
          "patient"."deleted_at" IS NULL
          ${
            options.organizationId
              ? ` AND
                  "patient"."organization_id" = $2
                `
              : ''
          }
          ${
            options.search
              ? ` AND 
                  "patient"."first_name" || ( CASE WHEN "patient"."middle_name" IS NULL THEN ' '  ELSE ' ' || "patient"."middle_name" || ' ' END ) || "patient"."last_name" ILIKE ${
                    options.organizationId ? '$3' : '$2'
                  }
                `
              : ''
          }
        )
      )
    UNION
      (
        SELECT
          "supervisor"."id"                           AS "id",
          "supervisor"."first_name"                   AS "firstName",
          "supervisor"."middle_name"                  AS "middleName",
          "supervisor"."last_name"                    AS "lastName",
          "supervisor"."username"                     AS "username",
          "supervisor"."role"                         AS "role",
          "supervisor"."gender"                       AS "gender",
          "supervisor"."profile_pic"                  AS "profilePic",
          "supervisor"."profile_pic_thumbnail"        AS "profilePicThumbnail",
          "supervisor"."chat_id"                      AS "chatId",
          "supervisor"."organization_id"              AS "organizationId",
          "patient_mapping"."is_incharge"             AS "isIncharge",
          "patient_mapping"."user_id"                 AS "supervisorId",
          "patient_mapping"."patient_id"              AS "patientId",
          "patient"."first_name"                      AS "patientFirstName",
          "patient"."middle_name"                     AS "patientMiddleName",
          "patient"."last_name"                       AS "patientLastName",
          "patient"."username"                        AS "patientUsername"
        FROM 
          "users" "supervisor"
        INNER JOIN 
          "patient_supervision_mapping" "patient_mapping"
            ON (
              "patient_mapping"."patient_id" IN (${SupervisorsPatientIdsSQL}) 
              AND
              "patient_mapping"."user_id" = "supervisor"."id"
              AND
              "patient_mapping"."deleted_at" IS NULL
            )
        INNER JOIN 
          "users" "patient"
            ON (
              "patient_mapping"."patient_id" = "patient"."id"
              AND
              "patient"."deleted_at" IS NULL
            )  
        WHERE 
          (
            "supervisor"."id" <> $1
            AND
            "supervisor"."deleted_at" IS NULL
            ${
              options.organizationId
                ? ` AND
                    "supervisor"."organization_id" = $2
                  `
                : ''
            }
            ${
              options.search
                ? ` AND 
                    "supervisor"."first_name" || (CASE WHEN "supervisor"."middle_name" IS NULL THEN ' '  ELSE ' ' || "supervisor"."middle_name" || ' ' END ) || "supervisor"."last_name" ILIKE ${
                      options.organizationId ? '$3' : '$2'
                    }
                  `
                : ''
            }
          )
      )
    )
    ORDER BY "firstName" ASC, "middleName" ASC, "lastName" ASC
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
