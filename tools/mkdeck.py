"""把 Guitar Lab 各章投影片原稿寫進已發布頁面的外框（流程見 deck_shell.py）。

用法：python -X utf8 tools/mkdeck.py 1 2 3（不加參數則全部重建）
讀取 tools/decks/chNN.html（第一行是「章名|英文副標|說明」，其餘是 <section class="slide"> 內容），
輸出 site/guitar/chNN/index.html。
"""
from deck_shell import run

if __name__ == '__main__':
    run('guitar')
