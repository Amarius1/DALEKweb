export function logicCore(thruster) {

    nozzleFind(thruster);
    chamberFind(thruster);
    combustionFind(thruster);
    injectorFind(thruster);
    inputObject(thruster);
    thrusterOutput(thruster);
    thrusterDisplay(thruster);
    bellGenerator(thruster);
    document.addEventListener('DOMContentLoaded', function () {
        valueCopy(thruster);

    }, false);
}
function nozzleFind(thruster) {
    // Assuming "thruster" is an object with properties corresponding to CET.Thrust, CET.ISP, CET.Pc, CET.W, and CET.ExpRat

    // Get mass flow rate
    const g0 = 9.81;
    const mDot = thruster.Thrust / (thruster.ISP * g0);

    // Update Pc and W
    const Pc = thruster.Pc * 100000;

    const Tc = thruster.Tc;

    const W = thruster.W / 1000;

    const R = 8.314;
    const k = 1.2;

    // Calculate TransVar (helper variable)
    const TransVar = Math.pow(2 / (k + 1), (k + 1) / (k - 1));

    // Calculate throat area (At)
    const At = (mDot * Math.sqrt((k * R * Tc) / W)) / (Math.sqrt(TransVar) * Pc * k);

    // Convert At to mm^2
    thruster.At = At * 1000000;

    // Calculate throat diameter (Dt)
    thruster.Dt = Math.sqrt(thruster.At / Math.PI) * 2;

    thruster.Rt = thruster.Dt / 2;
    // Calculate exit area (Ae)
    thruster.Ae = thruster.ExpRat * thruster.At;

    // Calculate exit diameter (De)
    thruster.De = Math.sqrt(thruster.Ae / Math.PI) * 2;
    thruster.Re = thruster.De / 2;
    // Calculate Length
    thruster.Length = LengthFindAdvanced(thruster) * 1000;

    // Assign mDot to the object
    thruster.mDot = mDot;


    console.log("Object updated - Nozzle")
}
function LengthFindAdvanced(thruster) {
    // Assuming "thruster" is an object with properties corresponding to CET.Conical, CET.BellPercent, CET.ThetaE, CET.ExpRat, and CET.Dt

    // Get properties from the "thruster" object
    const conical = thruster.Conical;
    const bell_percent = thruster.BellPercent;
    const theta = thruster.ThetaE;
    const ExpRat = thruster.ExpRat;
    const Dt = thruster.Dt;

    // Convert angle from degrees to radians
    const thetarad = (Math.PI / 180) * theta;

    // Calculate throat radius (Rt) in meters
    const Rt = (Dt / 2) / 1000;

    // Calculate R1
    const R1 = 1.382 * Rt;

    let Length;

    if (conical) {
        // Calculate Length for a conical nozzle
        Length = (Rt * (Math.sqrt(ExpRat) - 1) + R1 * (1 / Math.cos(thetarad) - 1)) / Math.tan(thetarad);
    } else {
        // Calculate Length for a bell-shaped nozzle
        Length = (bell_percent / 100) * (Rt * (Math.sqrt(ExpRat) - 1) + R1 * (1 / Math.cos(thetarad) - 1)) / Math.tan(thetarad);
    }

    // Assign Length to the "thruster" object
    return Length;

}
function chamberFind(thruster) {
    const ChamberConvergingLength = thruster.Lcc;
    const Lstar = thruster.Lstar;
    const chamberRad = (Math.PI / 180) * thruster.AlphaC; // Convert angle from degrees to radians

    // Calculate thrust chamber diameter (Dc)
    const Dc = 2 * (ChamberConvergingLength * Math.tan(chamberRad) + (thruster.Dt / 2));
    // Calculate chamber area (Ac)
    const Ac = (Math.PI * Math.pow(Dc, 2)) / 4;

    // Calculate chamber volume (Vc)
    const Vc = Lstar * thruster.At;

    // Calculate chamber length (Lc)
    const Lc = Vc / (1.1 * Ac);

    // Convert ChamberLength from meters to millimeters
    const ChamberLength = Lc * 1000;
    thruster.Rc = Dc / 2;
    const SafetyFactor = 2.5;
    const WallThickness = Math.sqrt(5) * (Dc * thruster.Pc / 10) / ((1 / SafetyFactor) * thruster.Stress);
    // Assign values to the "thruster" object
    thruster.Lc = ChamberLength;
    thruster.Dc = Dc;
    thruster.Ac = Ac;
    thruster.Wt = WallThickness;
    console.log("Object updated - Chamber");
}
function combustionFind(thruster) {
    // Convert ignition delay time from milliseconds to seconds
    const IDT = thruster.IDT / 1000;

    // Convert density units from [g/cm3] to [kg/m3]
    const rho = 1.45 * 1000; // Hydrogen peroxide density [kg/m3]
    const rhoF = thruster.Density * 1000; // Fuel density [kg/m3]
    const oxRat = 3; // Oxygen ratio
    const rhoCombined = (oxRat * rho + rhoF) / (oxRat + 1);

    const designOffset = 8.5;

    // Convert Dt from millimeters to meters
    const R = (thruster.Dt / 1000) / 2; // Radius in meters

    // Calculate the cross-sectional area (A)
    const A = Math.PI * Math.pow(R, 2);

    // Calculate velocity (V)
    const V = thruster.mDot / (rhoCombined * A);

    // Calculate Length in millimeters
    const Length = V * IDT * 1000 + designOffset;

    // Assign Length to the "thruster" object
    thruster.IgnLocation = Length;

    console.log("Object updated - Combustion location");
}
function injectorFind(thruster) {

    const oxRat = 3;
    const n = 2;
    const rho = 1.45 * 1000;
    const deltaP = (20 / 100) * thruster.Pc; // [Pa] assuming a 20% injector pressure drop

    const mDot = (oxRat / (oxRat + 1)) * thruster.mDot; // mass flow rate of H2O2
    const A1 = mDot / (0.8 * Math.sqrt(2 * rho * deltaP)); // total area of ox injector
    const A2 = (A1 / n) * 1000000; // area per hole [m] to [mm]
    thruster.Di = 2 * Math.sqrt(A2 / Math.PI); // diameter per hole

    console.log("Object updated - Injector");
    //console.log(deltaP);
}

function thrusterDisplay(thruster) {

    const containerWidth = document.getElementById('thrusterContainer').offsetWidth;
    const containerHeight = document.getElementById('thrusterContainer').offsetHeight;

    var scale = 6;
    var scaley = 6;

    if ((thruster.Lc + thruster.Length) > (14 / 100) * containerWidth) {
        var scale = 4.5;
        var scaley = 4.5;
    }
    if ((thruster.Lc + thruster.Length) > (20 / 100) * containerWidth) {
        var scale = 3;
        var scaley = 3;
    }
    if ((thruster.Lc + thruster.Length) > (25 / 100) * containerWidth) {
        var scale = 1.5;
        var scaley = 1.5;
    }
    if ((thruster.Lc + thruster.Length) > (65 / 100) * containerWidth) {
        var scale = 0.75;
        var scaley = 0.75;
    }
    if ((thruster.Lc + thruster.Length) > (75 / 100) * containerWidth) {
        var scale = 0.25;
        var scaley = 0.25;
    }
    const injector = document.querySelectorAll('.injector_mock');
    injector[0].style.height = thruster.Dc * scaley + "px";

    const chamber = document.querySelectorAll('.combustion_chamber');
    chamber[0].style.width = thruster.Lc * scale + "px";
    chamber[0].style.height = thruster.Dc * scaley + "px";

    const converging = document.querySelectorAll('.converging_section');
    converging[0].style.width = thruster.Lcc * scale + "px";
    converging[0].style.height = thruster.Dc * scaley + "px";
    const helper1 = 1 * ((scaley * thruster.Dc / 2) - (scaley * thruster.Dt / 2) + scaley * thruster.Dt);
    const helper2 = 1 * ((scaley * thruster.Dc / 2) + (scaley * thruster.Dt / 2) - scaley * thruster.Dt);
    converging[0].style.clipPath = `polygon(0 0, 100% ${helper2}px, 100% ${helper1}px, 0% 100%)`;

    const nozzle = document.querySelectorAll('.nozzle');
    nozzle[0].style.width = thruster.Length * scale + "px";
    nozzle[0].style.height = thruster.De * scaley + "px";

    const helper3 = 1 * ((scaley * thruster.De / 2) - (scaley * thruster.Dt / 2) + scaley * thruster.Dt);
    const helper4 = 1 * ((scaley * thruster.De / 2) + (scaley * thruster.Dt / 2) - scaley * thruster.Dt);
    nozzle[0].style.clipPath = `polygon(0 ${helper3}px, 0 ${helper4}px, 100% 0, 100% 100%)`;

    console.log("Display model updated");


    const chamberRad = (Math.PI / 180) * thruster.AlphaC;
    const nozzleRad = (Math.PI / 180) * thruster.ThetaE;

    const angle_correction = - thruster.Wt * thruster.WtMulti * Math.pow(Math.cos(chamberRad), 2);
    const angle_correction2 = - thruster.Wt * thruster.WtMulti * Math.pow(Math.cos(nozzleRad), 2);

    const injector_mock_thickness = document.querySelectorAll('.injector_mock_thickness');
    injector_mock_thickness[0].style.height = (thruster.Dc + 2 * thruster.Wt) * scaley + "px";

    const comb_thickness = document.querySelectorAll('.comb_thickness');
    comb_thickness[0].style.width = thruster.Lc * scale + "px";
    comb_thickness[0].style.height = (thruster.Dc + 2 * thruster.Wt) * scaley + "px";

    const conv_thickness = document.querySelectorAll('.conv_thickness');
    conv_thickness[0].style.width = thruster.Lcc * scale + "px";
    conv_thickness[0].style.height = (thruster.Dc + 2 * thruster.Wt) * scaley + "px";
    const helper5 = 1 * ((scaley * (thruster.Dc + 2 * thruster.Wt) / 2) - (scaley * (thruster.Dt + 2 * thruster.Wt) / 2) + scaley * (thruster.Dt + 2 * thruster.Wt));
    const helper6 = 1 * ((scaley * (thruster.Dc + 2 * thruster.Wt) / 2) + (scaley * (thruster.Dt + 2 * thruster.Wt) / 2) - scaley * (thruster.Dt + 2 * thruster.Wt));
    conv_thickness[0].style.clipPath = `polygon(0 ${angle_correction}px, 100% ${helper6 + angle_correction}px, 100% ${helper5 - angle_correction}px, 0% ${helper5 + helper6 - angle_correction}px)`;

    const nozz_thickness = document.querySelectorAll('.nozz_thickness');
    nozz_thickness[0].style.width = thruster.Length * scale + "px";
    nozz_thickness[0].style.height = (thruster.De + 2 * thruster.Wt) * scaley + "px";

    const helper7 = 1 * ((scaley * (thruster.De + 2 * thruster.Wt) / 2) - (scaley * (thruster.Dt + 2 * thruster.Wt) / 2) + scaley * (thruster.Dt + 2 * thruster.Wt));
    const helper8 = 1 * ((scaley * (thruster.De + 2 * thruster.Wt) / 2) + (scaley * (thruster.Dt + 2 * thruster.Wt) / 2) - scaley * (thruster.Dt + 2 * thruster.Wt));
    nozz_thickness[0].style.clipPath = `polygon(0 ${helper7 - angle_correction}px, 0 ${helper8 + angle_correction}px, 100% 0, 100% 100%)`;
    console.log(helper6);
}

export function inputObject(thruster) {
    for (const key in thruster) {

        if (thruster.hasOwnProperty(key)) {
            const value = thruster[key];
            //console.log(`${key}: ${value}`);

            // Find the element with id as key + "Slider"
            const sliderId = key + "Slider";
            const slider = document.getElementById(sliderId);

            // Check if the element exists and assign the value
            if (slider) {
                slider.value = value;
            }

            // Find the element with id as key + "Slider"
            const textId = key + "Text";
            const text = document.getElementById(textId);

            // Check if the element exists and assign the value
            if (text) {
                text.value = value;
                //console.log(value);
            }

            const counterId = key + "Counter";
            const counter = document.getElementById(counterId);

            // Check if the element exists and assign the value
            if (counter) {
                counter.textContent = value.toFixed(3);
                //console.log(value);
            }
        }
    }
}
export function inputInteract(thruster) {
    for (const key in thruster) {

        if (thruster.hasOwnProperty(key)) {
            const value = thruster[key];

            // Find the element with id as key + "Slider"
            const sliderId = key + "Slider";
            const slider = document.getElementById(sliderId);

            if (slider) {
                slider.addEventListener("input", function () {
                    thruster[key] = slider.value;
                    logicCore(thruster);
                    //inputObject(thruster);

                    //console.log(thruster);
                });
            }

            // Find the element with id as key + "Text"
            const textId = key + "Text";
            const text = document.getElementById(textId);

            if (text) {
                text.addEventListener("focusout", function () {
                    thruster[key] = text.value;
                    logicCore(thruster);
                    //inputObject(thruster);

                    //console.log(thruster);
                });
            }
            var conicalDropdown = document.getElementById("Conical");

            // Add an event listener to the dropdown to handle changes
            conicalDropdown.addEventListener("change", function () {
                // Get the selected option value
                var selectedValue = conicalDropdown.value;

                // Convert the selected value to a boolean and update the "thruster" object
                thruster.isConical = (selectedValue === "true");

                // Debugging: Output the updated "thruster" object to the console
                //console.log(thruster);
            });
        }
    }
    // Find the element with id as "Refresh"
    const refreshId = "Refresh";
    const refresh = document.getElementById(refreshId);

    if (refresh) {
        refresh.addEventListener("click", function () {
            logicCore(thruster);
        });
    }

    // Find the element with id as "Reset"
    const resetId = "Reset";
    const reset = document.getElementById(resetId);

    if (reset) {
        reset.addEventListener("click", function () {
            thruster.Thrust = 6.5;
            thruster.ISP = 200;
            thruster.Pc = 10;
            thruster.Tc = 2500;
            thruster.W = 25.2;
            thruster.ExpRat = 100;
            thruster.ThetaE = 15;
            thruster.BellPercent = 0;
            thruster.Lcc = 6.5;
            thruster.AlphaC = 60;
            thruster.Lstar = 4.7;
            thruster.Density = 1.11;
            thruster.IDT = 15;
            thruster.Conical = true;
            thruster.Stress = 90;
            thruster.WtMulti = 1;
            thruster.NWtMulti = 1;

            logicCore(thruster);
            console.log("Data reset");
        });
    }
}


function thrusterOutput(thruster) {
    // Define a flag to track whether the value has been copied recently
    let isCopied = false;

    // Loop through elements with class ".result"
    document.querySelectorAll('.result').forEach(element => {
        // Get the id attribute of the element
        const id = element.id;

        // Check if the id exists as a property in the thruster object
        if (thruster.hasOwnProperty(id)) {
            // Set the text content of the element to the corresponding value in the thruster object
            if (thruster[id] == thruster.Lcc || thruster[id] == thruster.AlphaC) {
                element.textContent = thruster[id];
            } else {
                element.textContent = thruster[id].toFixed(3);
            }



        } else {
            // Handle the case where the id doesn't match any property in the thruster object
            console.warn(`No matching property found for id "${id}"`);
        }
        console.log("Replaced");
    });
}

function valueCopy(thruster) {
    // Define a flag to track whether the value has been copied recently
    let isCopied = false;

    // Loop through elements with class ".result"
    document.querySelectorAll('.result').forEach(element => {
        // Get the id attribute of the element
        const id = element.id;

        // Add click event listener with a debounce to limit copying to every 0.5 seconds
        element.addEventListener('click', function () {
            if (isCopied == false) {
                function copy(element) {
                    var inp = document.createElement('input');
                    document.body.appendChild(inp)
                    inp.value = thruster[id]
                    inp.select();
                    document.execCommand('copy', false);
                    inp.remove();
                }

                // Call the copy function
                copy(element);

                // Set the flag to true to prevent further copying
                isCopied = true;

                // Optionally, you can give some visual feedback or log a message
                console.log('Value copied to clipboard:', thruster[id]);

                // Reset the flag after 0.5 seconds
                setTimeout(function () {
                    isCopied = false;
                }, 200);
            }
        });
    });
}



function CET(Thrust, ISP, Pc, Tc, W, ExpRat, ThetaE, Conical, BellPercent, Dt, De, Length, Lc, Lcc, Dc, AlphaC, Ac, mDot, Lstar, IgnLocation, Density, IDT, SLength, SD, InjectorDiameter, A1, A2, v, Rt, Stress, WtMulti, NWtMulti) {
    this.Thrust = Thrust;
    this.ISP = ISP;
    this.Pc = Pc;
    this.Tc = Tc;
    this.W = W;
    this.ExpRat = ExpRat;
    this.ThetaE = ThetaE;
    this.Conical = Conical;
    this.BellPercent = BellPercent;
    this.Dt = Dt;
    this.De = De;
    this.Length = Length;
    this.Lc = Lc;
    this.Lcc = Lcc;
    this.Dc = Dc;
    this.AlphaC = AlphaC;
    this.Ac = Ac;
    this.mDot = mDot;
    this.Lstar = Lstar;
    this.IgnLocation = IgnLocation;
    this.Density = Density;
    this.IDT = IDT;
    this.SLength = SLength;
    this.SD = SD;
    this.Di = InjectorDiameter;
    this.TestA1 = A1;
    this.TestA2 = A2;
    this.v = v;
    this.Rt = Rt;
    this.Stress = Stress;
    this.WtMulti = WtMulti;
    this.NWtMulti = NWtMulti;
}
export default CET;




// Declare buttons and ripple container outside of the DOMContentLoaded event listener
var buttons;
var rippleContainer;

document.addEventListener("DOMContentLoaded", function () {
    // Get all buttons with class ".btn" within ".categories"
    buttons = document.querySelectorAll(".categories .btn");

    // Get the container for the current tab
    var currentTabContainer = document.querySelector(".current_tab");

    // Get the container for all tabs
    var tabContainer = document.querySelector(".tab_container");

    // Get the container for ripple effect
    rippleContainer = document.querySelector(".thruster_properties");

    // Reference to the current selected tab
    var currentSelectedTab = null;

    // Function to update the displayed tab based on the clicked button
    function updateTab(event, button) {
        var targetId = button.getAttribute("target");
        var selectedTab = document.getElementById(targetId);

        // If there's a currently selected tab, move it back to the tabContainer
        if (currentSelectedTab) {
            tabContainer.appendChild(currentSelectedTab);
        }

        // Remove the "state" attribute from all buttons
        buttons.forEach(function (btn) {
            btn.removeAttribute("state");
        });

        // Set the "state" attribute for the clicked button to "selected"
        button.setAttribute("state", "selected");

        // Reference the selected tab before moving it to the current tab container
        currentSelectedTab = selectedTab;

        // Add class for fading out the current content
        currentTabContainer.classList.add("fade-out");

        // Set a timeout for the duration of the fade-out animation
        setTimeout(function () {
            // Remove the content of the current tab container
            currentTabContainer.innerHTML = "";

            // Move the selected tab content to the current tab container
            currentTabContainer.appendChild(selectedTab);

            // Remove the fade-out class
            currentTabContainer.classList.remove("fade-out");

            // Add class for fading in the new content
            currentTabContainer.classList.add("fade-in");

            // Set a timeout for the duration of the fade-in animation
            setTimeout(function () {
                // Remove the fade-in class after the animation is complete
                currentTabContainer.classList.remove("fade-in");
            }, 200); // Adjust the duration as needed

        }, 200); // Adjust the duration as needed
    }

    // Add click event listener to each button
    buttons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            // Pass the event object to the updateTab function
            updateTab(event, button);
        });

        // Check if the button has "state" attribute with value "selected" on page load
        if (button.getAttribute("state") === "selected") {
            updateTab(undefined, button);
        }
    });

});












function drawCurves(ctx, thruster, scaleFactor) {
    // Clear the canvas


    // Calculate mirrored y-coordinate
    function mirrorY(y, flip) {
        return flip ? -y : y;
    }

    function drawCurveToPoint(x1, y1, deltaX, alpha) {
      
        var x2 = x1 + deltaX;

         // Draw the straight line between points 1 and 2
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1); // y-coordinate is the same as point 1
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the curve
        ctx.beginPath();
        ctx.moveTo(x1, y1);

        var controlPointX = x1 + deltaX / 2;
        var controlPointY = y1 + Math.tan(alpha * (Math.PI / 180)) * (deltaX / 2);

        ctx.quadraticCurveTo(controlPointX, controlPointY, x2, y1);

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw the original curve
    drawCurveToPoint(0, 100, 130, 15);

    // Draw the flipped curve
    //const startPoint2 = { x: 0, y: -thruster.Rt * scaleFactor };
    //drawCurve(startPoint2, -30, -8, thruster.Length);

    //const startPoint3 = { x: 0, y: thruster.Rt * scaleFactor };
    //drawCurve(startPoint3, 30, 0, -thruster.Lcc);

    //const startPoint4 = { x: 0, y: -thruster.Rt * scaleFactor };
    //drawCurve(startPoint4, -30, -0, -thruster.Lcc);
}
function manipulateCanvas(thruster) {
    // Check if the element with id "myCanvas" exists
    var existingCanvas = document.getElementById("myCanvas");

    // Check if the element with id "canvasWrapper" exists
    var canvasWrapper = document.getElementById("canvasWrapper");

    const containerWidth = document.getElementById('thrusterContainer').offsetWidth;

    var scale = 6;
    var scaley = 6;

    if ((thruster.Lc + thruster.Length) > (14 / 100) * containerWidth) {
        var scale = 4.5;
        var scaley = 4.5;
    }
    if ((thruster.Lc + thruster.Length) > (20 / 100) * containerWidth) {
        var scale = 3;
        var scaley = 3;
    }
    if ((thruster.Lc + thruster.Length) > (25 / 100) * containerWidth) {
        var scale = 1.5;
        var scaley = 1.5;
    }
    if ((thruster.Lc + thruster.Length) > (65 / 100) * containerWidth) {
        var scale = 0.75;
        var scaley = 0.75;
    }
    if ((thruster.Lc + thruster.Length) > (75 / 100) * containerWidth) {
        var scale = 0.25;
        var scaley = 0.25;
    }
    const scaleFactor = scale;
    const XscaleFactor = scale;
    const YscaleFactor = scale;

    function createCanvasElem() {
        // If "myCanvas" does not exist, create a new canvas element
        var newCanvas = document.createElement("canvas");
        newCanvas.id = "myCanvas";
        newCanvas.width = 500;
        newCanvas.height = 500;

        const canvas = newCanvas; // Replace 'myCanvas' with the actual ID of your canvas element
        const ctx = canvas.getContext('2d');

        
        

        ctx.translate(scaleFactor*thruster.Lcc, canvas.height / 2);
        
        drawCurves(ctx, thruster, scaleFactor);

        // Append the new canvas to the "canvasWrapper" element
        canvasWrapper.appendChild(newCanvas);
        console.log("exists")
    }
    if (!existingCanvas) {

        createCanvasElem();
    } else {
        //const canvas = document.getElementById('myCanvas');
        existingCanvas.remove();
        createCanvasElem();
    }
}
function bellGenerator(thruster) {
    manipulateCanvas(thruster);
    // Get the canvas element and its 2D context

}