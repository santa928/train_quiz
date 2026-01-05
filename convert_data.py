import json
import re

# Hiragana mapping
kana_map = {
    "山手線": "やまのてせん",
    "京浜東北線": "けいひんとうほくせん",
    "中央線快速": "ちゅうおうせん",
    "中央・総武緩行線": "そうぶせん",
    "東海道線": "とうかいどうせん",
    "横須賀線": "よこすかせん",
    "南武線": "なんぶせん",
    "横浜線": "よこはません",
    "京葉線": "けいようせん",
    "武蔵野線": "むさしのせん",
    "埼京線": "さいきょうせん",
    "湘南新宿ライン": "しょうなんしんじゅくらいん",
    "上野東京ライン": "うえのとうきょうらいん",
    "常磐線快速": "じょうばんせん",
    "常磐線各駅停車": "じょうばんせん",
    "高崎線": "たかさきせん",
    "宇都宮線": "うつのみやせん",
    "銀座線": "ぎんざせん",
    "丸ノ内線": "まるのうちせん",
    "日比谷線": "ひびやせん",
    "東西線": "とうざいせん",
    "千代田線": "ちよだせん",
    "有楽町線": "ゆうらくちょうせん",
    "半蔵門線": "はんぞうもんせん",
    "南北線": "なんぼくせん",
    "副都心線": "ふくとしんせん",
    "都営浅草線": "あさくさせん",
    "都営三田線": "みたせん",
    "都営新宿線": "しんじゅくせん",
    "都営大江戸線": "おおえどせん",
    "京王線": "けいおうせん",
    "京王井の頭線": "いのかしらせん",
    "京王新線": "けいおうしんせん",
    "京王相模原線": "さがみはらせん",
    "京王高尾線": "たかおせん",
    "小田急小田原線": "おだきゅうせん",
    "小田急江ノ島線": "えのしません",
    "小田急多摩線": "たません",
    "東急東横線": "とうよこせん",
    "東急目黒線": "めぐろせん",
    "東急田園都市線": "でんえんとしせん",
    "東急大井町線": "おおいまちせん",
    "東急池上線": "いけがみせん",
    "東急多摩川線": "たまがわせん",
    "東急世田谷線": "せたがやせん",
    "京急本線": "けいきゅうせん",
    "京急空港線": "くうこうせん",
    "京成成田空港線": "なりたくうこうせん",
    "西武池袋線": "せいぶいけぶくろせん",
    "西武新宿線": "せいぶしんじゅくせん",
    "西武有楽町線": "せいぶゆうらくちょうせん",
    "西武豊島線": "せいぶとしません",
    "西武西武園線": "せいぶえんせん",
    "西武国分寺線": "こくぶんじせん",
    "西武多摩湖線": "たまこせん",
    "西武多摩川線": "せいぶたまがわせん",
    "西武秩父線": "ちちぶせん",
    "西武拝島線": "はいじません",
    "西武狭山線": "さやません",
    "西武山口線": "やまぐちせん",
    "東武東上線": "とうぶとうじょうせん",
    "東武伊勢崎線": "いせさきせん",
    "東武スカイツリーライン": "すかいつりーらいん",
    "伊勢崎線（東武スカイツリーライン）": "すかいつりーらいん",
    "東武亀戸線": "かめいどせん",
    "東武大師線": "だいしせん",
    "東武野田線": "のだせん",
    "アーバンパークライン": "あーばんぱーくらいん",
    "東武日光線": "にっこうせん",
    "東武宇都宮線": "うつのみやせん",
    "東武鬼怒川線": "きぬがわせん",
    "東武佐野線": "さのせん",
    "東武桐生線": "きりゅうせん",
    "東武小泉線": "こいずみせん",
    "京成本線": "けいせいほんせん",
    "成田空港線（成田スカイアクセス線）": "すかいあくせすせん",
    "京成押上線": "おしあげせん",
    "京成金町線": "かなまちせん",
    "京成千葉線": "けいせいちばせん",
    "京成千原線": "ちはらせん",
    "北総線": "ほくそうせん",
    "つくばエクスプレス": "つくばえくすぷれす",
    "ゆりかもめ": "ゆりかもめ",
    "りんかい線": "りんかいせん",
    "埼玉高速鉄道線": "さいたまこうそく",
    "東京モノレール": "ものれーる"
}

def get_label(line_name):
    return kana_map.get(line_name, line_name)  # Fallback to name if not found

with open('temp_lines.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Naive extraction of the array content
# Assuming export const lines = [ ... ];
start = content.find('[')
end = content.rfind(']')
if start != -1 and end != -1:
    json_str = content[start:end+1]
    
    # The keys in the JS object might not be quoted (e.g. id: "jr-01").
    # IDs are likely quoted in this file (based on previous cat: "id": "private-01").
    # But let's verify. Actually the 'git show' output showed quoted keys: "id": "private-21".
    # So it should be valid JSON if we remove trailing commas.
    
    # Remove trailing commas
    json_str = re.sub(r',\s*]', ']', json_str)
    json_str = re.sub(r',\s*}', '}', json_str)
    
    try:
        data = json.loads(json_str)
        
        output_data = []
        for item in data:
            # Construct new item
            new_item = {
                "id": item["id"],
                "name": item["lineName"], # Using Line Name as main name
                "label": get_label(item["lineName"]),
                "image": item["image"],
                "credit": "Wikimedia Commons" # Simplifying credit
            }
            output_data.append(new_item)
            
        with open('data/trains.json', 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully converted {len(output_data)} trains.")
        
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        # Fallback: Maybe keys are not quoted? (The previous cat output showed quoted keys)
else:
    print("Could not find array in temp_lines.js")
