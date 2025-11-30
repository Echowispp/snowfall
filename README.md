# Snowfall

<a href="https://snowfall-gamma.vercel.app/">Demo</a>

This is a simple and overoptimized snowfall simulator. The main focus is on the physics that are being done here, I made this sim almost as realistic as I could. If I wanted even more, I'd need to go into fluid dynamics, which is... No thanks. Anyways, this in its current state looks good enough.

# User guide

Very simple: look at the canvas and drag the sliders around, it's a sandbox. Mess around or something.

# Tech stack

Order of stuff added and changes made:

1.  The very first thing I did was a simple framework to add functionality to, as I usually do, I feel it helps with getting started on a larger project
2.  Second thing I did was adding a simple check for removing and spawning snowflakes
3.  Speaking of the slider commit, I added the three sliders next, with the basic parameters.
4.  I snuck in a link to the demo, then proceeded to change the parameters to what they are now: gravity, "heaviness" (basically the same as thickness or amount) and wind speed.
    Gravity and wind speed are calculated with
    sqrt(gravity^2 + windSpeed^2) = moveSpeed,
    where moveSpeed is the acceleration multiplier of the snowflakes (for further potential interest, please see the source code)

    What does that equation mean? It and the other one for moveAngle
    (the variable that dictates the direction of movement), "moveAngle =
    atan2(gravity, windSpeed)" mean that increasing wind speed lessens
    the effect of gravity on the flakes, and that increasing gravity...
    increases gravity

5.  The next bit isn't too complicated to explain, it is just a sinewave pattern the flakes do when flying through the air
6.  The largest ug this project ever saw was fixed here, it is difficult to explain exactly but basically, snowflakes were spawning on different spots more than on others due to the way that flake creation was implemented. I switched to a different spawning approach, and it works now.
    The details are basically that now the flakes spawn on random positions and instead of being erased as they were before, they just teleport to the other side when they would otherwise fly out of the canvas area.
7.  After that, the changes are pretty minor, adding another flutter pattern (the snowflakes make occasional circles now, this pattern is designed based on behaviour of real life snow as I remember it, while the other one is the closest approximation of real snowflakes' chaotic movement that is reasonable to implement and doesn't have a small chance of defying physics), adding comments for code readability, fixing a few small bugs and now of course writing this README.
