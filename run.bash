#!/bin/bash

# Set the input and output folders
input_folder="./svg"
output_folder="./output"

# Create output folder if it doesn't exist
mkdir -p "$output_folder"

# Iterate over SVG files in the input folder
for svg_file in "$input_folder"/*.svg; do
    # Extract filename without extension
    filename=$(basename -- "$svg_file")
    filename_no_ext="${filename%.*}"

    # Set output font file path
    output_font="$output_folder/$filename_no_ext.ttf"

    # Run FontForge script for each SVG file
    fontforge -script svg_to_font.pe "$svg_file" "$output_font"
done
