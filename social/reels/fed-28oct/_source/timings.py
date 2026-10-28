import json
W = [("The",0.08,0.16),("Fed",0.24,0.48),("held",0.56,0.72),("rates",0.8,1.12),("today...",1.32,1.84),("at",1.96,2.08),("three",2.16,2.24),("point",2.4,2.64),("seven",2.72,2.8),("five",2.96,3.2),("to",3.36,3.52),("four",3.6,3.68),("percent.",3.84,4.56),("But",4.8,5.04),("it",5.12,5.28),("wasn't",5.36,5.6),("unanimous.",5.68,6.32),("Two",6.72,6.8),("officials",6.88,7.36),("voted",7.44,7.68),("for",7.76,7.84),("another",8.04,8.24),("hike.",8.32,8.72),("The",9.2,9.24),("Fed",9.28,9.52),("says",9.6,9.84),("inflation",9.92,10.4),("remains",10.48,10.88),("elevated,",11.04,11.84),("after",11.96,12.08),("it",12.16,12.24),("raised",12.32,12.56),("rates",12.64,12.88),("in",12.96,13.04),("September.",13.32,14.16),("Next",14.28,14.4),("up:",14.48,15.04),("US",15.12,15.36),("jobs",15.52,15.76),("data",15.84,16.08),("on",16.16,16.24),("November",16.32,16.64),("sixth,",16.8,17.44),("inflation",17.52,18.08),("on",18.16,18.24),("November",18.4,18.56),("tenth,",18.72,19.36),("and",19.48,19.6),("the",19.64,19.68),("Fed's",19.76,20.08),("next",20.2,20.32),("decision",20.4,20.88),("on",20.96,21.04),("December",21.24,21.44),("ninth.",21.6,22.4)]
# caption chunks: display words with how many spoken words each consumes
C = [
 [("The",1),("Fed",1),("held",1),("rates",1),("today",1)],
 [("at",1),("3.75%",4),("to",1),("4%",2)],
 [("But",1),("it",1),("wasn't",1),("unanimous.",1)],
 [("Two",1),("officials",1),("voted",1)],
 [("for",1),("another",1),("hike.",1)],
 [("The",1),("Fed",1),("says",1),("inflation",1)],
 [("remains",1),("elevated,",1)],
 [("after",1),("it",1),("raised",1),("rates",1),("in",1),("September.",1)],
 [("Next",1),("up:",1),("US",1),("jobs",1),("data",1)],
 [("on",1),("November",1),("6,",1)],
 [("inflation",1),("on",1),("November",1),("10,",1)],
 [("and",1),("the",1),("Fed's",1),("next",1),("decision",1)],
 [("on",1),("December",1),("9.",1)],
]
i = 0; out = []
for ch in C:
    words = []
    for txt, n in ch:
        words.append({"w": txt, "s": W[i][1], "e": W[i+n-1][2]}); i += n
    out.append(words)
assert i == len(W), (i, len(W))
for k, ch in enumerate(out):
    ch_s = ch[0]["s"]; ch_e = out[k+1][0]["s"] if k+1 < len(out) else ch[-1]["e"] + 0.15
    out[k] = {"s": ch_s - 0.05, "e": ch_e - 0.05, "words": ch}
json.dump(out, open("captions.json", "w"))
print(len(out), "chunks")
