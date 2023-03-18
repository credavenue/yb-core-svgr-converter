#!/bin/bash

icons=($(ls ./src_svg/*.svg | awk -F/ '{print $NF}'))
if [ ${#icons[@]} -eq 0 ]; then
    echo "No icons provided."
    exit 1
fi

# Find the line number of the identifier
file_path="yb-core-icon/README.md"
line_number="$(grep -n "(-----)" "$file_path" | cut -d':' -f1)"
line_number=$((line_number-2))
echo "Line Number ${line_number-2}"

# Create a temporary file to hold the new entries
temp_file=$(mktemp)
echo -n > "$temp_file"

# Loop through the icons and add new entries to the temporary file
for icon in "${icons[@]}"; do
    # Add the new entry to the temporary file
    echo "| $icon | <img src=\"https://baseUrl/$icon\" width='50' height='50' > |" >> "$temp_file"
done

# Insert the new entries into the original file
sed "${line_number}r $temp_file" "$file_path" > "$file_path.tmp"
mv "$file_path.tmp" "$file_path"
rm "$temp_file"

echo "Icons updated successfully."