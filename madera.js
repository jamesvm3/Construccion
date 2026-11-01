/* Madera para el portal: valores característicos de Cálculo rápido de estructuras (S. Mute, ficha MT), en kN/cm² y kg/m³. */
window.MADERA={
 C18:{fm:1.80,fv:0.34,ft0:1.10,fc0:1.80,fc90:0.22,E:900,rho:380,bn:0.80,chi:[0.99,0.94,0.88,0.78,0.65,0.53,0.43,0.35,0.29,0.24,0.21,0.18,0.15,0.14,0.12,0.11,0.10,0.09,0.08]},
 C24:{fm:2.40,fv:0.40,ft0:1.40,fc0:2.20,fc90:0.25,E:1100,rho:420,bn:0.80,chi:[0.99,0.95,0.89,0.80,0.68,0.55,0.45,0.37,0.31,0.26,0.22,0.19,0.16,0.14,0.13,0.11,0.10,0.09,0.08]},
 D30:{fm:3.00,fv:0.40,ft0:1.80,fc0:2.30,fc90:0.80,E:1200,rho:640,bn:0.55,chi:[0.99,0.95,0.88,0.79,0.67,0.55,0.44,0.36,0.30,0.25,0.22,0.19,0.16,0.14,0.12,0.11,0.10,0.09,0.08]},
 GL24h:{fm:2.40,fv:0.27,ft0:1.65,fc0:2.40,fc90:0.27,E:1160,rho:460,bn:0.70,chi:[1.00,0.98,0.95,0.89,0.80,0.66,0.54,0.44,0.36,0.30,0.25,0.22,0.19,0.16,0.15,0.13,0.12,0.10,0.09]}
};
/* χ por interpolación lineal en la tabla (λ = 20…200 cada 10); λ < 20 → 1 */
window.chiMadera=function(cl,lam){const t=window.MADERA[cl].chi;if(lam<=20)return lam<20?Math.min(1,1-(1-t[0])*lam/20):t[0];if(lam>=200)return t[18];const i=Math.floor((lam-20)/10),f=(lam-20)/10-i;return t[i]+(t[i+1]-t[i])*f;};
