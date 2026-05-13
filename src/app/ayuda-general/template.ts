export const INFOGRAFIA_TEMPLATE = (url: string) => `
  <html>
    <head>
      <title>UCAB - Infografias. Fuente: PsicoData Venezuela</title>
<style>
  body { 
    margin: 0; 
    background: #0e0e0e; 
    display: flex; 
    justify-content: center; 
    align-items: center;
    height: 100vh;
    overflow: hidden;
  }

  img { 
    max-height: 98vh;
    max-width: 98vw;
    width: auto;
    height: auto;
    cursor: zoom-in;
    transition: all 0.2s ease;
  }

  img.zoom-active { 
    max-height: none; 
    max-width: none;
    width: 800px;
    cursor: zoom-out;
  }

  body.scrolling {
    align-items: flex-start;
    overflow-y: auto;
  }
</style>
    </head>
    <body>
      <img src="${url}" onclick="this.classList.toggle('zoom-active')" />
    </body>
  </html>
`;