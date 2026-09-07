WITH team_costs AS (
    SELECT
        s.yearid,
        t.teamid,
        t.name AS team_name,
        SUM(s.salary) AS total_salary,
        t.w AS wins,
        SUM(s.salary) / NULLIF(t.w, 0) AS cost_per_win
    FROM salaries s
    JOIN teams t
        ON s.teamid = t.teamid
        AND s.yearid = t.yearid
    WHERE s.yearid = 2010
    GROUP BY s.yearid, t.teamid, t.name, t.w
),
ranked AS (
    SELECT
        yearid,
        teamid,
        team_name,
        total_salary,
        wins,
        cost_per_win,
        ROW_NUMBER() OVER (
            PARTITION BY yearid
            ORDER BY cost_per_win ASC   -- smallest cost per win first
        ) AS rn
    FROM team_costs
)
SELECT
    yearid,
    teamid,
    team_name,
    total_salary,
    wins,
    cost_per_win
FROM ranked
WHERE rn = 1;
