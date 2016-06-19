(context, env, fragment, tags, tasitc) => {
  const classAttr = tags.length ? 'class='+tags.join(' ')+'"' : '';
  const idAttr = fragment ? 'id="'+fragment+'"' : '';
  let attrs = '';
  if (classAttr.length) {
    attrs = ' '+classAttr;
  }
  if (idAttr.length) {
    attrs = ' '+idAttr;
  }
  return '<li'+attrs+'>'+(typeof content)+'</li>';
};
