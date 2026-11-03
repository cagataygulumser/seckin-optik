from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import sys
SRC='/tmp/claude-0/font/pjs.ttf'
def font(w):
    f=TTFont(SRC); return instantiateVariableFont(f,{"wght":w})
def metin(f,text,x,base,size,track=0):
    gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm; s=size/upm
    pen=SVGPathPen(gs); cx=x
    for ch in text:
        g=cmap[ord(ch)]
        tp=TransformPen(pen,(s,0,0,-s,cx,base)); gs[g].draw(tp)
        cx+=gs[g].width*s+track
    return pen.getCommands(), cx
F8=font(800); F6=font(600)
def isaret(lacivert,mavi,ox=0,oy=0,k=1.0):
    # tatlı yuvarlak gözlük: iki yumuşak mercek + köprü + parlama
    def t(v,ax): return v*k+(ox if ax=='x' else oy)
    sw=5.2*k
    L=f"<rect x='{t(3,'x')}' y='{t(6,'y')}' width='{26*k}' height='{22*k}' rx='{11*k}' fill='none' stroke='{lacivert}' stroke-width='{sw}'/>"
    R=f"<rect x='{t(41,'x')}' y='{t(6,'y')}' width='{26*k}' height='{22*k}' rx='{11*k}' fill='none' stroke='{lacivert}' stroke-width='{sw}'/>"
    B=f"<path d='M{t(29,'x')} {t(14,'y')} Q{t(35,'x')} {t(8,'y')} {t(41,'x')} {t(14,'y')}' fill='none' stroke='{lacivert}' stroke-width='{sw}' stroke-linecap='round'/>"
    H1=f"<path d='M{t(9.5,'x')} {t(17,'y')} Q{t(10,'x')} {t(12,'y')} {t(15,'x')} {t(11.5,'y')}' fill='none' stroke='{mavi}' stroke-width='{3.2*k}' stroke-linecap='round'/>"
    H2=f"<path d='M{t(47.5,'x')} {t(17,'y')} Q{t(48,'x')} {t(12,'y')} {t(53,'x')} {t(11.5,'y')}' fill='none' stroke='{mavi}' stroke-width='{3.2*k}' stroke-linecap='round'/>"
    return L+R+B+H1+H2
def logo(lacivert,mavi,yazi1,yazi2):
    p1,x1=metin(F8,"Seçkin",80,33,30,-0.6)
    p2,x2=metin(F6,"Optik",x1+8,33,30,-0.3)
    W=round(x2+4)
    return f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} 44' width='{W*4}' height='176' role='img' aria-label='Seçkin Optik'>{isaret(lacivert,mavi,ox=0,oy=4)}<path d='{p1}' fill='{yazi1}'/><path d='{p2}' fill='{yazi2}'/></svg>"
LAC='#02122C'; MAV='#004EA9'
open('seckin-optik-logo.svg','w').write(logo(LAC,MAV,LAC,MAV))
open('seckin-optik-logo-beyaz.svg','w').write(logo('#FFFFFF','#8EC1FF','#FFFFFF','#8EC1FF'))
open('seckin-optik-isaret.svg','w').write(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='-2 0 74 36' width='296' height='144'>{isaret(LAC,MAV,oy=1)}</svg>")
# favicon: lacivert kare içinde beyaz gözlük
open('favicon.svg','w').write(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='256' height='256'><rect width='64' height='64' rx='16' fill='{LAC}'/>{isaret('#FFFFFF','#8EC1FF',ox=3.5,oy=16,k=0.8)}</svg>")
print('ok')
