WITH team_heights AS (
    SELECT
        b.yearid,
        t.teamid,
        t.name AS team_name,
        AVG(p.height) AS avg_batter_height
    FROM batting b
    JOIN people p
        ON b.playerid = p.playerid
    JOIN teams t
        ON b.teamid = t.teamid
        AND b.yearid = t.yearid
    WHERE p.height IS NOT NULL
    GROUP BY b.yearid, t.teamid, t.name
),
ranked AS (
    SELECT
        yearid,
        teamid,
        team_name,
        avg_batter_height,
        ROW_NUMBER() OVER (
            PARTITION BY yearid
            ORDER BY avg_batter_height ASC   -- smallest height first
        ) AS rn
    FROM team_heights
)
SELECT
    yearid,
    teamid,
    team_name,
    ROUND(avg_batter_height, 2) AS "Average Batter Height"
FROM ranked
WHERE rn = 1
ORDER BY yearid;
