import sqlite3

db_path = "safeguard.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("DELETE FROM violations")
c.execute("DELETE FROM alerts")
conn.commit()

print("Cleaned up violations and alerts database.")
conn.close()
