# -*- coding: utf-8 -*-
"""独立统计每篇的字数/h3/白话/类比/譬喻框/测验"""
import re, io, sys, os

PLAIN = ['说白了', '听着玄', '换成大白话', '其实就是', '干的活儿', '打个比方',
         '相当于', '好比', '就像', '想象一下', '不妨这样想', '通俗地说',
         '简单说', '本质上就是', '翻译成人话']

LIFE = ['厨房', '菜市场', '快递', '餐厅', '公交', '地铁', '医院', '学校', '办公室',
        '装修', '洗衣', '停车', '流水线', '图书馆', '相亲', '招聘', '点菜', '开会',
        '分诊', '分拣', '翻译', '外卖', '超市', '银行', '邮局', '厨师',
        '冰箱', '案板', '调料', '水管', '打电话', '门牌', '通讯录', '收音机',
        '乐高', '下山', '前台', '包裹', '绣花', '雕刻', '照片', '作业', '考试',
        '小区', '电梯', '钥匙', '安检', '印章', '便签', '传送带', '会议', '车间',
        '仓库', '货架', '排队', '窗口', '挂号', '科室', '教室', '黑板', '笔记']

def check(p):
    raw = io.open(p, encoding='utf-8').read()
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', raw, flags=re.S)
    s = re.sub(r'<div class="lab"[^>]*></div>', '', s, flags=re.S)
    body = re.sub(r'<[^>]+>', '', s)
    w = len(re.findall(r'[\u4e00-\u9fff]', body))
    h3 = len(re.findall(r'<h3', raw))
    need = max(5, int(w / 1000 * 1.5))
    ph = sum(body.count(k) for k in PLAIN)
    lh = sum(1 for k in LIFE if k in body)
    analogy = 'analogy' in raw
    quiz = 'data-lab="quiz"' in raw
    print('=' * 60)
    print(os.path.basename(p))
    print('  字数 %d  (需>7000)' % w)
    print('  h3   %d  (需>=10)' % h3)
    print('  白话 %d  (需>=%d)' % (ph, need))
    print('  类比 %d种  (需>=8)' % lh)
    print('  譬喻框 %s  测验 %s' % (analogy, quiz))
    # 各白话关键词计数
    hits = {k: body.count(k) for k in PLAIN}
    total = sum(hits.values())
    print('  白话关键词: ' + ', '.join('%s=%d' % (k, c) for k, c in hits.items() if c))

for p in sys.argv[1:]:
    check(p)