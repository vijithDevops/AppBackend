import { parseArrayForSqlQuery } from 'src/common/utils/helpers';
import { Role } from '../../user/entity/user.enum';
import { IAddAppointmentUsersPaginateFilter } from '../interfaces';
import { AppointmentUserIdsSQL } from './get_appointment_users_ids.sql';

export const AddAppointmentUserListPaginateSQL = (
  filters: IAddAppointmentUsersPaginateFilter,
) => {
  const sql = `
    (
      (
        SELECT
          "caretaker"."id"                           AS "id",
          "caretaker"."first_name"                   AS "firstName",
          "caretaker"."middle_name"                  AS "middleName",
          "caretaker"."last_name"                    AS "lastName",
          "caretaker"."username"                     AS "username",
          "caretaker"."role"                         AS "role",
          "caretaker"."gender"                       AS "gender",
          "caretaker"."profile_pic"                  AS "profilePic",
          "caretaker"."profile_pic_thumbnail"        AS "profilePicThumbnail",
          "caretaker"."chat_id"                      AS "chatId"
        FROM 
          "users" "caretaker"
        INNER JOIN 
          "caretaker_info" "caretaker_info"
            ON (
              "caretaker_info"."caretaker_id" = "caretaker"."id"
              AND
              "caretaker_info"."patient_id" = '${filters.patientId}'
            )
        WHERE 
          (
            "caretaker"."deleted_at" IS NULL
            AND
           "caretaker"."role" = '${Role.CARETAKER}'
           AND
           "caretaker"."organization_id" = '${filters.organizationId}'
           ${
             filters.appointmentId
               ? ` AND
                    "caretaker"."id" NOT IN (${AppointmentUserIdsSQL(
                      filters.appointmentId,
                    )})`
               : ''
           }
           ${
             filters.excludeUserIds.length > 0
               ? ` AND
                    "caretaker"."id" NOT IN (${parseArrayForSqlQuery(
                      filters.excludeUserIds,
                    )})`
               : ''
           }
          ${
            filters.search
              ? ` AND 
                  "caretaker"."first_name" || (CASE WHEN "caretaker"."middle_name" IS NULL THEN ' '  ELSE ' ' || "caretaker"."middle_name" || ' ' END ) || "caretaker"."last_name" ILIKE $1
                `
              : ''
          }
          )
      )
      UNION
      (
        SELECT
          "user"."id"                    AS "id",
          "user"."first_name"            AS "firstName",
          "user"."middle_name"           AS "middleName",
          "user"."last_name"             AS "lastName",
          "user"."username"              AS "username",
          "user"."role"                  AS "role",
          "user"."gender"                AS "gender",
          "user"."profile_pic"           AS "profilePic",
          "user"."profile_pic_thumbnail" AS "profilePicThumbnail",
          "user"."chat_id"               AS "chatId"
        FROM 
          "users" "user"
        WHERE (
          "user"."deleted_at" IS NULL
          AND
           "user"."role" IN ('${Role.DOCTOR}','${Role.NURSE}')
          AND
          "user"."organization_id" = '${filters.organizationId}'
          ${
            filters.appointmentId
              ? ` AND
                  "user"."id" NOT IN (${AppointmentUserIdsSQL(
                    filters.appointmentId,
                  )})`
              : ''
          }
          ${
            filters.excludeUserIds.length > 0
              ? ` AND
                   "user"."id" NOT IN (${parseArrayForSqlQuery(
                     filters.excludeUserIds,
                   )})`
              : ''
          }
          ${
            filters.search
              ? ` AND 
                  "user"."first_name" || (CASE WHEN "user"."middle_name" IS NULL THEN ' '  ELSE ' ' || "user"."middle_name" || ' ' END ) || "user"."last_name" ILIKE $1
                `
              : ''
          }
        )
      )
    )
    ORDER BY "role" DESC, "firstName" DESC, "middleName" DESC, "lastName" DESC
  `;
  return {
    listQuery: `
      ${sql}
      LIMIT ${filters.limit}
      OFFSET ${filters.skip}
    `,
    countQuery: `
      SELECT COUNT(*)  
      FROM 
        (${sql})
      AS "unionCount"
    `,
  };
};
