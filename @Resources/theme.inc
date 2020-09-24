[Variables]
palette.primary.color=0xFFFFFF
palette.background.default=0x000000
palette.background.bar=0x242424
bar.width=100
bar.height=7

[BackgroundStyle]
SolidColor=#palette.background.default#
X=0
Y=0
W=195
H=30

[NumberStyle]
FontFace=Inconsolata
Padding=0,-3,0,0
FontColor=#palette.primary.color#
FontSize=10
StringAlign=Right
AntiAlias=1
X=80
Y=r

[TextStyle]
StringStyle=Normal
StringAlign=Left
X=5

[BarStyle]
SolidColor=#palette.background.bar#
BarColor=#palette.primary.color#
BarOrientation=Horizontal
X=85
Y=r
W=#bar.width#
H=#bar.height#
AntiAlias=1

[UpperBarStyle]
TransformationMatrix=1; 0; -1; 1; 10; 0

[LowerBarStyle]
TransformationMatrix=1; 0; -1; 1; 25; 0
