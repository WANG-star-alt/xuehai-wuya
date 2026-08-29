# -*- coding: utf-8 -*-
"""粗略检查常见内联标签开闭是否成对，及 section 块结构是否完好"""
import re, io, sys
TAGS = ['mark', 'strong', 'em', 'code', 'b', 'i']
for p in sys.argv[1:]:
    raw = io.open(p, encoding='utf-8').read()
    print('====', p.split('\\')[-1])
    bad = []
    for t in TAGS:
        o = len(re.findall(r'<%s(\s[^>]*)?>' % t, raw))
        # careful: only count tags that are opening (not containing '/')
        c = len(re.findall(r'</%s>' % t, raw))
        if o != c:
            bad.append('%s open=%d close=%d' % (t, o, c))
    # div balance: count open div (not self-closing) vs close /div>
    do = len(re.findall(r'<div(?![^>]*/>)', raw))
    dc = len(re.findall(r'</div>', raw))
    print('  div open=%d close=%d' % (do, dc))
    if bad:
        print('  MISMATCH: ' + '; '.join(bad))
    else:
        print('  inline tags balanced OK')