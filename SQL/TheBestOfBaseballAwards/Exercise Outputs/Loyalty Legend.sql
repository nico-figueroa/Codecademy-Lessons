-- The Loyalty Legend: this query identifies the player who has spent the most years with a single team, along with the first and last years they played for that team.
WITH player_team_years AS (
    SELECT
        a.playerid,
        a.teamid,
        COUNT(DISTINCT a.yearid) AS years_with_team,
        MIN(a.yearid) AS first_year_with_team,
        MAX(a.yearid) AS last_year_with_team
    FROM appearances a
    GROUP BY a.playerid, a.teamid
),
player_team_info AS (
    SELECT
        pty.playerid,
        pty.teamid,
        pty.years_with_team,
        pty.first_year_with_team,
        pty.last_year_with_team,
        ppl.namefirst || ' ' || ppl.namelast AS player_name,
        t.name AS team_name
    FROM player_team_years pty
    JOIN people ppl
        ON pty.playerid = ppl.playerid
    JOIN teams t
        ON pty.teamid = t.teamid
       AND t.yearid = pty.first_year_with_team
),
ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            ORDER BY years_with_team DESC
        ) AS rn
    FROM player_team_info
)
SELECT
    playerid,
    player_name,
    teamid,
    team_name,
    years_with_team,
    first_year_with_team,
    last_year_with_team
FROM ranked
WHERE rn = 1;
