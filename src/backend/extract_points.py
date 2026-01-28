import sqlite3

con = sqlite3.connect("db.db").cursor()
result = con.execute("SELECT username, level, hidden FROM users").fetchall()
pos = 0
banned_names = ["justpufferfish", "admin", "skeleton628"]
score_dict = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 4,
    "4": 5,
    "5": 6,
    "7": 8,
    "8": 10
}

def get_score(score_dict, score) -> int:
    final_score = 0
    for i in range(1, score + 1):
        final_score += score_dict[str(i)]
    return final_score

result = sorted(
    result,
    key = lambda x: x[1],
    reverse=True
)


print("╭──── PURKYNTHON SCORE :3 ────╮")
for name, sc, hidden in result:
    if sc != 0 and not hidden and name not in banned_names:
        pos += 1
        print(f"╰ #{pos}: {name},   level: {sc},    {get_score(score_dict, sc)} points")

print("╰──── PURKYNTHON SCORE :3 ────╯")
