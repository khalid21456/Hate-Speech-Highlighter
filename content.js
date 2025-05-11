function getVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => {
      if (!node.parentNode) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(node.parentNode);
      return (style && style.display !== "none" && style.visibility !== "hidden")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });

  let text = "";
  while (walker.nextNode()) {
    text += walker.currentNode.nodeValue + " ";
  }
  return text.trim();
}

function highlightPhrase(phrase) {
  const regex = new RegExp(phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');

  document.querySelectorAll("body *").forEach(el => {
    el.childNodes.forEach(child => {
      if (child.nodeType === 3 && regex.test(child.nodeValue)) {
        const span = document.createElement("span");
        span.innerHTML = child.nodeValue.replace(regex, `<mark style="background-color: red; color: white;">$&</mark>`);
        el.replaceChild(span, child);
      }
    });
  });
}

const pageText = getVisibleText();

fetch('http://localhost:5000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: pageText })
})
.then(response => response.json())
.then(data => {
  const hatefulPhrases = data.detected_terms || [];
  hatefulPhrases.forEach(phrase => highlightPhrase(phrase));
})
.catch(err => console.error("Error:", err));
