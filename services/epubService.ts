import JSZip from 'jszip';
import { Workspace } from '../types';

export const generateEpub = async (workspace: Workspace): Promise<Blob> => {
  const zip = new JSZip();

  // 1. Mimetype (must be first, no compression)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  zip.folder("META-INF")?.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>`);

  // 3. OEBPS Folder
  const oebps = zip.folder("OEBPS");

  // CSS
  oebps?.file("style.css", `
    body { font-family: serif; line-height: 1.6; padding: 20px; }
    h1 { text-align: center; color: #333; }
    p { margin-bottom: 1em; text-indent: 1em; }
    .cover-title { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
    .cover-author { font-size: 1.2em; font-style: italic; }
  `);

  // Content (Simple approach: One chapter for current text)
  // In a real app, you'd iterate through chapter arrays.
  const contentHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${workspace.name}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${workspace.name}</h1>
  <div class="content">
    ${workspace.translatedText ? workspace.translatedText.split('\n').map(p => `<p>${p}</p>`).join('') : '<p>No content translated yet.</p>'}
  </div>
</body>
</html>`;

  oebps?.file("content.xhtml", contentHtml);

  // OPF (Package Document)
  const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>${workspace.name}</dc:title>
        <dc:creator opf:role="aut">${workspace.author || 'Unknown'}</dc:creator>
        <dc:language>${workspace.config.targetLang}</dc:language>
        <dc:identifier id="BookID" opf:scheme="UUID">${workspace.id}</dc:identifier>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="style" href="style.css" media-type="text/css"/>
        <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    </manifest>
    <spine toc="ncx">
        <itemref idref="content"/>
    </spine>
</package>`;

  oebps?.file("content.opf", opfContent);

  // NCX (Navigation)
  const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
   "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="${workspace.id}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${workspace.name}</text>
    </docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel>
                <text>Start</text>
            </navLabel>
            <content src="content.xhtml"/>
        </navPoint>
    </navMap>
</ncx>`;

  oebps?.file("toc.ncx", ncxContent);

  return await zip.generateAsync({ type: "blob" });
};