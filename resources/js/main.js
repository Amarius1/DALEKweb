export function logicCore(thruster) {

    nozzleFind(thruster);
    chamberFind(thruster);
    combustionFind(thruster);
    injectorFind(thruster);
    thrusterDisplay(thruster);
    console.log(thruster);
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

    // Calculate exit area (Ae)
    thruster.Ae = thruster.ExpRat * thruster.At;

    // Calculate exit diameter (De)
    thruster.De = Math.sqrt(thruster.Ae / Math.PI) * 2;

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

    // Assign values to the "thruster" object
    thruster.Lc = ChamberLength;
    thruster.Dc = Dc;
    thruster.Ac = Ac;
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
    console.log(deltaP);
}

function thrusterDisplay(thruster) {

    const containerWidth = document.getElementById('thrusterContainer').offsetWidth;
    const containerHeight = document.getElementById('thrusterContainer').offsetHeight;

    var scale = 5;
    var scaley = 5;

    if((thruster.Lc) > (9.5/100)*containerWidth)
    {
        var scale = 2.5;
        var scaley = 2.5;
    }
    if((thruster.Lc) > (20/100)*containerWidth)
    {
        var scale = 1;
        var scaley = 1;
    }
    if((thruster.Lc) > (50/100)*containerWidth)
    {
        var scale = 0.75;
        var scaley = 0.75;
    }
    if((thruster.Lc) > (70/100)*containerWidth)
    {
        var scale = 0.25;
        var scaley = 0.25;
    }

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
                counter.textContent = value;
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
                    inputObject(thruster);

                    console.log(thruster);
                });
            }

            // Find the element with id as key + "Text"
            const textId = key + "Text";
            const text = document.getElementById(textId);

            if (text) {
                text.addEventListener("focusout", function () {
                    thruster[key] = text.value;
                    logicCore(thruster);
                    inputObject(thruster);

                    console.log(thruster);
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
                console.log(thruster);
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

    // Find the element with id as "Refresh"
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

            inputObject(thruster);
            logicCore(thruster);
        });
    }
}

function CET(Thrust, ISP, Pc, Tc, W, ExpRat, ThetaE, Conical, BellPercent, Dt, De, Length, Lc, Lcc, Dc, AlphaC, Ac, mDot, Lstar, IgnLocation, Density, IDT, SLength, SD, InjectorDiameter, A1, A2, v) {
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
}
export default CET;





