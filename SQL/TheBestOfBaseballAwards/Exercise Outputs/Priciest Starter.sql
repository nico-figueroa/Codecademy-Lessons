WITH pitcher_costs AS (
    SELECT
        s.yearid,
        pit.playerid,
        ppl.namefirst || ' ' || ppl.namelast AS pitcher_name,
        SUM(s.salary) AS total_salary,
        pit.gs AS games_started,
        SUM(s.salary) / pit.gs AS cost_per_start
    FROM salaries s
    JOIN pitching pit
        ON s.playerid = pit.playerid
        AND s.yearid = pit.yearid
    JOIN people ppl
        ON s.playerid = ppl.playerid
    WHERE pit.gs >= 10
    GROUP BY s.yearid, pit.playerid, pitcher_name, pit.gs
),
ranked AS (
    SELECT
        yearid,
        playerid,
        pitcher_name,
        total_salary,
        games_started,
        cost_per_start,
        ROW_NUMBER() OVER (
            PARTITION BY yearid
            ORDER BY cost_per_start DESC   -- highest cost per start first
        ) AS rn
    FROM pitcher_costs
)
SELECT
    yearid,
    playerid,
    pitcher_name,
    total_salary,
    games_started,
    cost_per_start
FROM ranked
WHERE rn = 1;
