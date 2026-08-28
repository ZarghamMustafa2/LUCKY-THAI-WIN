import os
import zipfile

root_dir = r"e:\NUMBER BET"
zip_filename = os.path.join(root_dir, "BPEXCH-FINAL-PROJECT.zip")

exclude_dirs = {"node_modules", ".git", ".vercel", "__pycache__"}
exclude_files = {"BPEXCH-FINAL-PROJECT.zip"}

print(f"Creating complete final project ZIP archive: {zip_filename}...")

file_count = 0
total_bytes = 0

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(root_dir):
        # Filter out excluded directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file in exclude_files:
                continue
            
            abs_filepath = os.path.join(root, file)
            rel_path = os.path.relpath(abs_filepath, root_dir)
            
            zipf.write(abs_filepath, rel_path)
            file_count += 1
            total_bytes += os.path.getsize(abs_filepath)

print(f"✅ SUCCESS: Created {zip_filename}")
print(f"   Files included: {file_count}")
print(f"   Uncompressed size: {total_bytes} bytes")
print(f"   Archive size: {os.path.getsize(zip_filename)} bytes")
