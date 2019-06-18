const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = 1337;
const headRegex = /(<head>).*(<\/head>)/g;

app.use(express.static(__dirname));

app.get('*', async(req, res) => {
  if (req.url.includes('/$/')) {
    res.sendFile(path.join(__dirname, '/index.html'));
  }

  const claimId = req.url.split('/').pop();
  const queryUrl = `https://chainquery.lbry.io/api/sql?query=SELECT * FROM claim where claim_id="${claimId}"`;

  const [finalHtml] = await Promise.all([fetch(queryUrl)
    .then(response => response.json())
    .then(claim => {
      if (!claim.success || !claim.data[0]) {
        return path.join(__dirname, '/index.html');
      }

      claim = claim.data[0];

      // const claimAuthor = claim.channel_name ? claim.channel_name : 'Anonymous';
      const claimDescription = claim.description && claim.description.length > 0 ? claim.description : 'Visit LBRY.tv for more content!';
      const claimLanguage = claim.language || 'en_US';
      const claimThumnail = claim.thumbnail_url || '/og.png';
      const claimTitle = `${claim.title} on LBRY.tv` || 'LBRY.tv'; // `${claim.title} from ${claimAuthor} on LBRY.tv`;
      const claimUrl = `https://beta.lbry.tv/${claim.name}/${claim.claim_id}` || 'https://beta.lbry.tv';
      // This comment was inlined and preventing the rest of the script to load
      const indexHtml = readFileSync(path.join(__dirname, '/index.html'), 'utf8').replace(/\s\s/gm, '').replace(/>\s</gm, '><').replace('// Use relative path if we are in electron', '');
      let finalTags = '';

      finalTags += '<meta charset="utf8"/>';
      finalTags += `<meta name="description" content="${claimDescription}"/>`;
      finalTags += `<meta name="keywords" content="${claim.tags ? claim.tags.toString() : ''}"/>`;
      finalTags += `<meta name="twitter:image" content="${claimThumnail}"/>`;
      finalTags += `<meta property="og:description" content="${claimDescription}"/>`;
      finalTags += `<meta property="og:image" content="${claimThumnail}"/>`;
      finalTags += `<meta property="og:locale" content="${claimLanguage}"/>`;
      finalTags += `<meta property="og:site_name" content="LBRY.tv"/>`;
      finalTags += `<meta property="og:type" content="website"/>`;
      finalTags += `<meta property="og:url" content="${claimUrl}"/>`;
      finalTags += `<title>${claimTitle}</title>`;

      try {
        writeFileSync(path.join(__dirname, '/index.share.html'), indexHtml.replace(indexHtml.match(headRegex)[0], finalTags), 'utf8');
        return path.join(__dirname, '/index.share.html');
      } catch (error) {
        return path.join(__dirname, '/index.html'); // ignore error and show default page
      }
    })]);

  res.sendFile(finalHtml);
});

app.listen(port, () => console.log(`UI server listening at http://localhost:${port}`));
