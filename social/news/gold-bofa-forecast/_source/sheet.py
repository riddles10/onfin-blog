import sys
from PIL import Image
l=sys.argv[1]
ims=[Image.open(f'out/gold-{l}-{i:02d}.png').convert('RGB') for i in range(1,11)]
w=360; h=int(ims[0].height*w/ims[0].width)
sh=Image.new('RGB',(5*w+40, 2*h+10),'white')
for k,im in enumerate(ims): sh.paste(im.resize((w,h)),((k%5)*(w+10),(k//5)*(h+10)))
sh.save(f'sheet-{l}.jpg',quality=82)
