import os

files = [
    r"c:\Users\aksha\Downloads\open cv project\Assembly Line A-Cam 01.mp4",
    r"c:\Users\aksha\Downloads\open cv project\Dock Area-Cam  02.mp4",
    r"c:\Users\aksha\Downloads\open cv project\Dock Area-Cam 02.mp4", # Attempt single space too
    r"c:\Users\aksha\Downloads\open cv project\upstairs-Cam 03.mp4"
]

print("Checking file existence:")
for f in files:
    exists = os.path.exists(f)
    print(f"'{f}': {exists}")
