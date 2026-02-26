# Quick Start Guide

Get up and running with Mermaid Viber CLI in 60 seconds!

## 1. Run the CLI

The project is already built and ready to go:

```bash
npm start
```

This will process all `.txt` files in the `mermaids/` directory and create styled JPEGs in the `images/` directory.

## 2. View Your Diagrams

After running, check the `images/` folder for your generated diagrams:

```bash
ls images/
# Output: flowchart.jpg, sequence-basic.jpg, sequence-with-images.jpg, class-diagram.jpg, state-diagram.jpg
```

## 3. Create Your Own Diagrams

Create a new `.txt` file in the `mermaids/` directory:

```bash
echo "graph LR
    A[Hello] --> B[World]" > mermaids/my-diagram.txt
```

Then run the CLI again:

```bash
npm start
```

Your new diagram will appear as `images/my-diagram.jpg`!

## 4. Use Custom Actor Images

Create sequence diagrams with custom images for actors:

```bash
cat > mermaids/my-sequence.txt << 'EOF'
sequenceDiagram
    participant img:https://cdn-icons-png.flaticon.com/512/149/149071.png Alice
    participant img:https://cdn-icons-png.flaticon.com/512/149/149072.png Bob

    Alice->>Bob: Hello!
    Bob-->>Alice: Hi there!
EOF
```

Run the CLI:

```bash
npm start
```

## Tips

- Use **URLs** for online images: `img:https://example.com/image.png`
- Use **local paths** for local images: `img:./my-image.png`
- All images are automatically rounded and positioned
- Export quality is 95% JPEG with 2x resolution for crisp results

## Example Output

The CLI provides clear progress reporting:

```
🎨 Mermaid Viber CLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Input directory:  /path/to/mermaids
📁 Output directory: /path/to/images

📄 Found 5 diagram file(s)

🔄 Processing: flowchart.txt
   ✅ Created: flowchart.jpg
🔄 Processing: sequence-basic.txt
   ✅ Created: sequence-basic.jpg
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successful: 5
❌ Failed:     0
```

## Need Help?

- Check the [README.md](README.md) for full documentation
- See example diagrams in the `mermaids/` directory
- Visit [Mermaid.js docs](https://mermaid.js.org/) for diagram syntax
