SELECT `main`.`Message`.`id`
FROM `main`.`Message`
WHERE (
        `main`.`Message`.`chatRoomId` = ?
        AND (
            NOT(
                (`main`.`Message`.`id`) IN (
                    SELECT `t1`.`messageId`
                    FROM `main`.`MessageReadBy` AS `t1`
                    WHERE (
                            `t1`.`userId` = ?
                            AND `t1`.`messageId` IS NOT NULL
                        )
                )
                AND (
                    NOT `main`.`Message`.`userId` = ?
                )
            )
        )
    )
LIMIT ?
OFFSET
    ?
    -- Params: ["cly27pk2u0003vnxmugv3p9qc",13,13,-1,0]