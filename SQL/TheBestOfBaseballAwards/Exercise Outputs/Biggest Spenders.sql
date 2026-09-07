WITH team_salaries AS (
    SELECT
        s.yearid,
        t.teamid,
        t.name AS team_name,
        SUM(s.salary) AS total_salary
    FROM salaries s
    JOIN teams t
        ON s.teamid = t.teamid
        AND s.yearid = t.yearid
    GROUP BY s.yearid, t.teamid, t.name
),
ranked AS (
    SELECT
        yearid,
        teamid,
        team_name,
        total_salary,
        ROW_NUMBER() OVER (
            PARTITION BY yearid
            ORDER BY total_salary DESC   -- largest salary first
        ) AS rn
    FROM team_salaries
)
SELECT
    yearid,
    teamid,
    team_name,
    total_salary
FROM ranked
WHERE rn = 1
ORDER BY yearid;
