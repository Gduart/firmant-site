export function BlogContent({ content }: { content: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="blog-article-content">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function renderBlock(block: string, index: number) {
  if (block.startsWith("### ")) {
    return <h3 key={index}>{block.replace(/^###\s+/, "")}</h3>;
  }

  if (block.startsWith("## ")) {
    return <h2 key={index}>{block.replace(/^##\s+/, "")}</h2>;
  }

  if (block.includes("\n- ") || block.startsWith("- ")) {
    const items = block
      .split("\n")
      .map((line) => line.replace(/^-\s+/, "").trim())
      .filter(Boolean);

    return (
      <ul key={index}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p key={index}>{block}</p>;
}
