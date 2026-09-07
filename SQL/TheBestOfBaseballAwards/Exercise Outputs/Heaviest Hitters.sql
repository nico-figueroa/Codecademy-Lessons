WITH team_weights AS (
    SELECT
        b.yearid,
        t.teamid,
        t.name AS team_name,
        AVG(p.weight) AS avg_batter_weight
    FROM batting b
    JOIN people p
        ON b.playerid = p.playerid
    JOIN teams t
        ON b.teamid = t.teamid
        AND b.yearid = t.yearid
    WHERE p.weight IS NOT NULL
    GROUP BY b.yearid, t.teamid, t.name
),
ranked AS (
    SELECT
        yearid,
        teamid,
        team_name,
        avg_batter_weight,
        ROW_NUMBER() OVER (
            PARTITION BY yearid
            ORDER BY avg_batter_weight DESC
        ) AS rn
    FROM team_weights
)
SELECT
    yearid,
    teamid,
    team_name,
    ROUND(avg_batter_weight, 2) AS "Average Batter Weight"
FROM ranked
WHERE rn = 1
ORDER BY yearid DESC;
