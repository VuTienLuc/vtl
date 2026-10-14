import re,io
import os
d=os.path.dirname(os.path.abspath(__file__))+'/'
h=open(d+'src/app.html',encoding='utf-8').read()
h=h.replace('/*CSS*/',open(d+'src/style.css',encoding='utf-8').read())
import json
gs=open(d+'apps-script/Code.gs',encoding='utf-8').read()
rd=lambda f:open(d+f,encoding='utf-8').read()
js='\n'.join([rd('src/lib/jsqr.min.js'),rd('src/lib/qrgen.min.js'),rd('src/core.js'),rd('src/msg.js'),rd('src/ui.js').replace('/*GSCODE*/',json.dumps(gs,ensure_ascii=False)),rd('src/grade.js'),rd('src/prog.js'),rd('src/rep.js'),rd('src/qrcore.js'),rd('src/qr.js'),rd('src/bk.js'),rd('src/boot.js')])
h=h.replace('/*JS*/',js.replace('</script>','<\\/script>'))
open(d+'index.html','w',encoding='utf-8').write(h)
print(len(h))
