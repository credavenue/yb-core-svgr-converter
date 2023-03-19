#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide version number"
  exit 1
fi

echo "$1"

if [ -z "$2" ]; then
  echo "Please provide type of operation. Types :- ADD, UPDATE, DELETE"
  exit 1
fi

case $2 in
  ADD)
    echo "ADD CALLED"
    icons=($(ls ./src_svg/*.svg | awk -F/ '{print $NF}'))
    if [ ${#icons[@]} -eq 0 ]; then
      echo "No icons provided."
      exit 1
    fi

    # Find the line number of the identifier
    file_path="yb-core-icon/README.md"
    line_number="$(grep -n "(-----)" "$file_path" | cut -d':' -f1)"
    line_number=$((line_number-2))

    # Create a temporary file to hold the new entries
    temp_file=$(mktemp)
    echo -n > "$temp_file"
    echo "" >> "$temp_file"
    echo "# version $1 (CLI ADD)" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "Added new Icons" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "| Icon Name | Icons |" >> "$temp_file"
    echo "| --------- | ----- |" >> "$temp_file"

    # Loop through the icons and add new entries to the temporary file
    for icon in "${icons[@]}"; do
      # Add the new entry to the temporary file
      echo "| $icon | <img src=\"https://baseUrl/$icon\" width='50' height='50' > |" >> "$temp_file"
    done

    # Insert the new entries into the original file
    sed "${line_number}r $temp_file" "$file_path" > "$file_path.tmp"
    mv "$file_path.tmp" "$file_path"
    rm "$temp_file"

    echo "Icons ADDED successfully."
    ;;
  UPDATE)
    echo "UPDATE CALLED"
    icons=($(ls ./src_svg/*.svg | awk -F/ '{print $NF}'))
    if [ ${#icons[@]} -eq 0 ]; then
      echo "No icons provided."
      exit 1
    fi

    # Find the line number of the identifier
    file_path="yb-core-icon/README.md"

    temp_file=$(mktemp)

    while read -r line; do
      # Loop through each .svg file and custom string pair
      for (( i=0; i<${#icons[@]}; i++ )); do
        # Check if the line contains the current .svg file
        if [[ "$line" == *" ${icons[i]} "* ]]; then
          # Replace the line with the current custom string
          line="| ${icons[i]} | (updated in version $1) |"
          break # Stop searching for this line since we've found a match
        fi
      done
      # Output the modified or unmodified line
      echo "$line" >> "$temp_file"
    done < "$file_path"

    cat "$temp_file" > "$file_path"
    rm "$temp_file"

    line_number="$(grep -n "(-----)" "$file_path" | cut -d':' -f1)"
    line_number=$((line_number-2))

    # Create a temporary file to hold the new entries
    temp_file=$(mktemp)
    echo -n > "$temp_file"
    echo "" >> "$temp_file"
    echo "# version $1 (CLI UPDATE)" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "Updated Icons " >> "$temp_file"
    echo "" >> "$temp_file"
    echo "| Icon Name | Icons |" >> "$temp_file"
    echo "| --------- | ----- |" >> "$temp_file"

    # Loop through the icons and add new entries to the temporary file
    for icon in "${icons[@]}"; do
        # Add the new entry to the temporary file
        echo "| $icon | <img src=\"https://baseUrl/$icon\" width='50' height='50' > |" >> "$temp_file"
    done

    # Insert the new entries into the original file
    sed "${line_number}r $temp_file" "$file_path" > "$file_path.tmp"
    mv "$file_path.tmp" "$file_path"
    rm "$temp_file"

    echo "Icons updated successfully.";;

    DELETE)
    echo "DELETE CALLED"
    icons=("${@:3}")
    if [ ${#icons[@]} -eq 0 ]; then
        echo "No icons provided."
        exit 1
    fi

    # Find the line number of the identifier
    file_path="yb-core-icon/README.md"
    temp_file=$(mktemp)

    while read -r line; do
        # Loop through each .svg file and custom string pair
        for (( i=0; i<${#icons[@]}; i++ )); do
            # Check if the line contains the current .svg file
            if [[ "$line" == *" ${icons[i]} "* ]]; then
                # Replace the line with the current custom string
                line="| ${icons[i]} | (deleted in version $1) |"
                break # Stop searching for this line since we've found a match
            fi
        done
        # Output the modified or unmodified line
        echo "$line" >> "$temp_file"
    done < "$file_path"

    cat "$temp_file" > "$file_path"
    rm "$temp_file"

    line_number="$(grep -n "(-----)" "$file_path" | cut -d':' -f1)"
    line_number=$((line_number-2))

    # Create a temporary file to hold the new entries
    temp_file=$(mktemp)
    echo -n > "$temp_file"
    echo "" >> "$temp_file"
    echo "# version $1 (CLI DELETE)" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "DELETED Icons " >> "$temp_file"
    echo "" >> "$temp_file"
    for (( i=0; i<${#icons[@]}; i++ )); do
        echo "${icons[i]}" >> "$temp_file"
    done

    # Insert the new entries into the original file
    sed "${line_number}r $temp_file" "$file_path" > "$file_path.tmp"
    mv "$file_path.tmp" "$file_path"
    rm "$temp_file"
    echo "Icons deleted successfully";;
esac