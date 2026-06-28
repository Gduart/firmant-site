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
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (block.startsWith("### ")) {
    return <h3 key={index}>{block.replace(/^###\s+/, "")}</h3>;
  }

  if (block.startsWith("## ")) {
    return <h2 key={index}>{block.replace(/^##\s+/, "")}</h2>;
  }

  if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(block)) {
    return <hr key={index} />;
  }

  if (isTable(lines)) {
    return renderTable(lines, index);
  }

  if (lines.every((line) => line.startsWith("> "))) {
    return (
      <blockquote key={index}>
        <p>{lines.map((line) => line.replace(/^>\s+/, "")).join(" ")}</p>
      </blockquote>
    );
  }

  if (lines.every((line) => /^-\s+/.test(line))) {
    const items = lines.map((line) => line.replace(/^-\s+/, ""));

    return (
      <ul key={index}>
        {items.map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    const items = lines.map((line) => line.replace(/^\d+\.\s+/, ""));

    return (
      <ol key={index}>
        {items.map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`}>{item}</li>
        ))}
      </ol>
    );
  }

  return <p key={index}>{block}</p>;
}

function isTable(lines: string[]) {
  if (lines.length < 2 || !lines.every((line) => line.startsWith("|") && line.endsWith("|"))) {
    return false;
  }

  const separatorCells = parseTableRow(lines[1]);
  return separatorCells.length > 0
    && separatorCells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderTable(lines: string[], index: number) {
  const headers = parseTableRow(lines[0]);
  const rows = lines.slice(2).map(parseTableRow);

  return (
    <div
      className="blog-article-table"
      key={index}
      role="region"
      aria-label="Tabela do artigo"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            {headers.map((header, columnIndex) => (
              <th key={`${index}-header-${columnIndex}`} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${index}-row-${rowIndex}`}>
              {row.map((cell, columnIndex) => (
                <td key={`${index}-${rowIndex}-${columnIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseTableRow(line: string) {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}
