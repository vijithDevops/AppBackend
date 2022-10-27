import { IFindUserAssignedPatientsOptions } from '../interfaces';

export const AssignedPatientListPaginateSQL = (
  options: IFindUserAssignedPatientsOptions,
) => {
  const sql = `
      SELECT
      "patient"."id"                            AS "id",
      "patient"."first_name"                    AS "firstName",
      "patient"."middle_name"                   AS "middleName",
      "patient"."last_name"                     AS "lastName",
      "patient"."username"                      AS "username",
      "patient"."role"                          AS "role",
      "patient"."gender"                        AS "gender",
      "patient"."address"                       AS "address",
      "patient"."profile_pic"                   AS "profilePic",
      "patient"."profile_pic_thumbnail"         AS "profilePicThumbnail",
      "patient"."chat_id"                       AS "chatId",
      "patient"."created_at"                    AS "createdAt",
      "patient_mapping"."is_incharge"           AS "isIncharge",
      "patient_info"."patient_id"               AS "patientId",
      "patient_info"."dob"                      AS "dob",
      "patient_info"."admission_date"           AS "admissionDate",
      "patient_info"."discharge_date"           AS "dischargeDate",
      "patient_info"."expected_end_date"        AS "expectedEndDate",
      "patient_info"."iris_on_board_date"       AS "irisOnboardDate",
      "patient_info"."nok_name"                 AS "nokName",
      "patient_info"."nok_contact_number"       AS "nokContactNumber",
      "patient_info"."nok_contact_email"        AS "nokContactEmail",
      (
        SELECT COUNT(*)
        FROM "appointment" "patient_appointment"
        WHERE
          "patient_appointment"."patient_id" = "patient"."id"
          AND
          "patient_appointment"."status" = $2
          AND
          "patient_appointment"."start_time" >= NOW()
          AND
          "patient_appointment"."deleted_at" IS NULL
      )                                         AS "upcomingAppointments",
      (
        SELECT COUNT(*)
          FROM "patient_note" "patient_note"
          WHERE
            "patient_note"."patient_id" = "patient"."id"
            AND
            "patient_note"."deleted_at" IS NULL
      )                                         AS "patientNotes",
      (
        SELECT "patient_appointment"."start_time"
        FROM "appointment" "patient_appointment"
        WHERE
        (
          "patient_appointment"."patient_id" = "patient"."id"
          AND
          "patient_appointment"."status" = $2
          AND
          "patient_appointment"."start_time" >= NOW()
          AND
          "patient_appointment"."deleted_at" IS NULL
        )
        ORDER BY "patient_appointment"."start_time"
        LIMIT 1
      )                                         AS "upComingAppointmentAt",
      (
        SELECT "patient_note"."created_at"
        FROM "patient_note" "patient_note"
        WHERE
        (
          "patient_note"."patient_id" = "patient"."id"
          AND
          "patient_note"."deleted_at" IS NULL
        )
        ORDER BY "patient_note"."created_at" DESC
        LIMIT 1
      )                                         AS "latestPatientNoteCreatedAt",
      (
        SELECT "patient_note"."notes"
        FROM "patient_note" "patient_note"
        WHERE
        (
          "patient_note"."patient_id" = "patient"."id"
          AND
          "patient_note"."deleted_at" IS NULL
        )
        ORDER BY "patient_note"."created_at" DESC
        LIMIT 1
      )                                         AS "latestPatientNote"
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
    LEFT JOIN 
      "patient_info" "patient_info"
      ON (
        "patient_info"."user_id" = "patient"."id"
      )
    WHERE (
      "patient"."deleted_at" IS NULL
      ${
        options.search
          ? ` AND 
              "patient"."first_name" || (CASE WHEN "patient"."middle_name" IS NULL THEN ' '  ELSE ' ' || "patient"."middle_name" || ' ' END ) || "patient"."last_name" ILIKE $3
            `
          : ''
      }
    )
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

// ${
//   options.field
//     ? `ORDER BY "${options.field}" ${options.sort}`
//     : `ORDER BY "firstName" ${options.sort}, "middleName" ${options.sort}, "lastName" ${options.sort}`
// }
