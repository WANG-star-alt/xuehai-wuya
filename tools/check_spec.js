// stats_check.py + tag_balance.py 的 JS 孪生版（无 python 环境时用 Exec 沙箱运行）
// 用法：把本文件内容作为 integrated_code_mode.Exec 的 code 参数，
//      修改末尾 PATHS 数组后执行；输出与 python 版逐项一致。
const PLAIN = ['说白了','听着玄','换成大白话','其实就是','干的活儿','打个比方',
  '相当于','好比','就像','想象一下','不妨这样想','通俗地说',
  '简单说','本质上就是','翻译成人话'];
const LIFE = ['厨房','菜市场','快递','餐厅','公交','地铁','医院','学校','办公室',
  '装修','洗衣','停车','流水线','图书馆','相亲','招聘','点菜','开会',
  '分诊','分拣','翻译','外卖','超市','银行','邮局','厨师',
  '冰箱','案板','调料','水管','打电话','门牌','通讯录','收音机',
  '乐高','下山','前台','包裹','绣花','雕刻','照片','作业','考试',
  '小区','电梯','钥匙','安检','印章','便签','传送带','会议','车间',
  '仓库','货架','排队','窗口','挂号','科室','教室','黑板','笔记'];

async function check(path) {
  const res = await tools.Read({ file_path: path });
  const raw0 = typeof res === 'string' ? res : (res.content || res.text || '');
  const raw = raw0.split('\n').map(l => l.replace(/^\s*\d+\t/, '')).join('\n');
  const body = raw
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<div class="lab"[^>]*><\/div>/g, '')
    .replace(/<[^>]+>/g, '');
  const w = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const h3 = (raw.match(/<h3/g) || []).length;
  const need = Math.max(5, Math.floor(w / 1000 * 1.5));
  let ph = 0, hits = {};
  for (const k of PLAIN) { const c = body.split(k).length - 1; hits[k] = c; ph += c; }
  const lh = LIFE.filter(k => body.includes(k)).length;
  const analogy = raw.includes('analogy');
  const quiz = raw.includes('data-lab="quiz"');
  text(`${path}`);
  text(`  字数 ${w} (需>7000)  h3 ${h3} (需>=10)  白话 ${ph} (需>=${need})  类比 ${lh}种 (需>=8)  譬喻框 ${analogy}  测验 ${quiz}`);
  text('  白话关键词: ' + Object.entries(hits).filter(([, c]) => c > 0).map(([k, c]) => `${k}=${c}`).join(', '));
  const TAGS = ['mark', 'strong', 'em', 'code', 'b', 'i'];
  let bad = [];
  for (const t of TAGS) {
    const o = (raw.match(new RegExp(`<${t}(\\s[^>]*)?>`, 'g')) || []).length;
    const c = (raw.match(new RegExp(`</${t}>`, 'g')) || []).length;
    if (o !== c) bad.push(`${t} open=${o} close=${c}`);
  }
  const doo = (raw.match(/<div(?![^>]*\/>)/g) || []).length;
  const dc = (raw.match(/<\/div>/g) || []).length;
  text(`  div open=${doo} close=${dc}  ` + (bad.length ? 'MISMATCH: ' + bad.join('; ') : 'inline tags balanced OK'));
}

const PATHS = [
  // 在此填入待校验文件，例如：
  // 'd:/TRAE 工作空间/xuehai-wuya/chapters/network/08-3-web-attacks.html',
];
for (const p of PATHS) await check(p);
