import re,io
import os
d=os.path.dirname(os.path.abspath(__file__))+'/'
h=open(d+'src/app.html',encoding='utf-8').read()
h=h.replace('/*CSS*/',open(d+'src/style.css',encoding='utf-8').read())
import json
gs=open(d+'apps-script/Code.gs',encoding='utf-8').read()
js=open(d+'src/core.js',encoding='utf-8').read()+'\n'+open(d+'src/msg.js',encoding='utf-8').read()+'\n'+open(d+'src/ui.js',encoding='utf-8').read().replace('/*GSCODE*/',json.dumps(gs,ensure_ascii=False))
h=h.replace('/*JS*/',js.replace('</script>','<\\/script>'))
open(d+'index.html','w',encoding='utf-8').write(h)
print(len(h))
