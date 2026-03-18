import React from "react";

/**
 * テキスト内のURLを検出してリンク化する関数
 * @param text - リンク化するテキスト
 * @returns リンク化されたReact要素の配列
 */
export function linkifyText(text: string): React.ReactNode {
  // URLを検出する正規表現
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const startIndex = match.index;

    // URLの前のテキストを追加
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // URLをリンクとして追加
    parts.push(
      React.createElement(
        "a",
        {
          key: startIndex,
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-500 hover:text-blue-700 underline",
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        url
      )
    );

    lastIndex = startIndex + url.length;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * 改行を含むテキストをリンク化して表示する関数
 * @param text - リンク化するテキスト（改行を含む）
 * @returns リンク化されたReact要素
 */
export function linkifyTextWithLineBreaks(text: string): React.ReactNode {
  const lines = text.split("\n");
  
  return lines.map((line, lineIndex) =>
    React.createElement(
      React.Fragment,
      { key: lineIndex },
      linkifyText(line),
      lineIndex < lines.length - 1 && React.createElement("br")
    )
  );
}
