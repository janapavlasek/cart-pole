% A linearlized model of an inverted pendulum on a cart.
M = 0.5;
m = 0.2;
b = 0.1;
I = 0.006;
g = 9.8;
l = 0.3;
q = (M+m)*(I+m*l^2)-(m*l)^2;
s = tf('s');

P_cart = (((I+m*l^2)/q)*s^2 - (m*g*l/q))/(s^4 + (b*(I + m*l^2))*s^3/q - ((M + m)*m*g*l)*s^2/q - b*m*g*l*s/q);
P_pend = (m*l*s/q)/(s^3 + (b*(I + m*l^2))*s^2/q - ((M + m)*m*g*l)*s/q - b*m*g*l/q);

rlocus(P_pend)
title('Root Locus of Plant (under Proportional Control)')

%%

% Add a PID controller with only 1 gain.

z = [-3 -4];
p = 0;
k = 1;
C = zpk(z,p,k);
rlocus(C*P_pend)
title('Root Locus with PID Controller')

%%
% Run this section to play with the roots.
controlSystemDesigner(C*P_pend)

%%

% Impulse response of our PID controller.
K = 20;
T = feedback(P_pend,K*C);
[response, t] = impulse(T);

% Plot the step response with a thicker line
figure;
plot(t, response, 'LineWidth', 2) % Set the line width to 2

% Customize the axes for larger, serif font
ax = gca;
ax.FontSize = 14;          % Set font size to 14
ax.FontName = 'Times';     % Set font to Times for a serif font
ax.Title.String = 'Impulse Response of Pendulum Angle under PID Control';
ax.Title.FontWeight = 'normal';

% Label the axes
xlabel('Time (seconds)')
ylabel('Amplitude')

%%

% Tuning the PID gains separately.
Kp = 1;
Ki = 1;
Kd = 1;
C = pid(Kp, Ki, Kd);

T = feedback(P_pend,K*C);
[response, t] = impulse(T);

% Plot the step response with a thicker line
figure;
plot(t, response, 'LineWidth', 2) % Set the line width to 2

% Customize the axes for larger, serif font
ax = gca;
ax.FontSize = 14;          % Set font size to 14
ax.FontName = 'Times';     % Set font to Times for a serif font
ax.Title.String = 'Impulse Response of Pendulum Angle under PID Control';
ax.Title.FontWeight = 'normal';

% Label the axes
xlabel('Time (seconds)')
ylabel('Amplitude')