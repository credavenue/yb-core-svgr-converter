#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide type of operation. Types :- ADD, DELETE"
  exit 1
fi

case $1 in
    ADD)
        echo "ADD CALLED"
        icons=($(ls ./src_svg/*.svg | awk -F/ '{print $NF}'))

        if [ ${#icons[@]} -eq 0 ]; then
            echo "No icons provided."
            exit 1
        fi

        # Find the line number of the identifier
        file_path="yb-core-icon/src/yb-core-icon/iconIndex.ts"
        line_number="$(grep -n "// (-----)" "$file_path" | cut -d':' -f1)"
        line_number=$((line_number-2))
        echo "Line Number ${line_number-2}"

        # Create a temporary file to hold the new entries
        temp_file=$(mktemp)
        echo -n > "$temp_file"

        # Loop through the icons and add new entries to the temporary file
        for icon in "${icons[@]}"; do
            # Generate the name of the icon
            name="$(echo "$icon" | sed 's/.svg//g')"

            # Add the new entry to the temporary file
            echo "\"$icon\": { uri: require('../svgr/$name.js') }," >> "$temp_file"
        done

        # Insert the new entries into the original file
        sed "${line_number}r $temp_file" "$file_path" > "$file_path.tmp"
        mv "$file_path.tmp" "$file_path"
        rm "$temp_file"

        echo "Icons updated successfully."
        ;;

    DELETE)
        echo "DELETE CALLED"
        icons=("${@:2}")

        if [ ${#icons[@]} -eq 0 ]; then
            echo "No icons provided."
            exit 1
        fi

        file_path="yb-core-icon/src/yb-core-icon/iconIndex.ts"
        temp_file=$(mktemp)

        while read -r line; do
            # Loop through each .svg file and custom string pair
            for (( i=0; i<${#icons[@]}; i++ )); do
                # Check if the line contains the current .svg file
                if [[ "$line" == *"\"${icons[i]}\""* ]]; then
                    # Replace the line with the current custom string
                    line="// (delete-line-temp-placeholder)"
                    break # Stop searching for this line since we've found a match
                fi
            done

            # Output the modified or unmodified line
            if [[ "$line" != "// (delete-line-temp-placeholder)" ]]; then
                echo "$line" >> "$temp_file"
            fi
        done < "$file_path"

        cat "$temp_file" > "$file_path"
        rm "$temp_file"

        echo "Icons Deleted Successfully"
        ;;
esac
