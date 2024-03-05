% Define the system from lecture.
s = tf('s');
plant = (s + 7)/((s - 2)*(s + 4)*(s + 8));

% Create a graph of the poles and zeros.
poles = pole(plant);
zeros = zero(plant);
hold on
scatter(real(poles), imag(poles), 100, "x")
scatter(real(zeros), imag(zeros), 100, "o")
title('Poles and zeros')
hold off

%%

% Generate the open-loop step response of this system.
[response, t] = step(plant);

% Plot formatting.
figure;
plot(t, response, 'LineWidth', 2) % Set the line width to 2

% Customize the axes for larger, serif font
ax = gca;
ax.FontSize = 14;          % Set font size to 14
ax.FontName = 'Times';     % Set font to Times for a serif font
ax.Title.String = 'Step Response';
ax.Title.FontWeight = 'normal';

% Label the axes
xlabel('Time (seconds)')
ylabel('Amplitude')

%%

% Plot the root locus of this system with proportional control.
rlocus(plant)
title('Root Locus of Plant (under Proportional Control)')

%%

% Use this block to play with the control parameters.
controlSystemDesigner(plant)

%% 

% Define the closed-loop proportional controller for testing.
K = 1;  % Change based on your tuned gain!
C = pid(K);
T = feedback(C*plant,1);

% Simulate the step response.
[response, t] = step(T);

% Plot formatting.
figure;
plot(t, response, 'LineWidth', 2) % Set the line width to 2

% Customize the axes for larger, serif font
ax = gca;
ax.FontSize = 14;          % Set font size to 14
ax.FontName = 'Times';     % Set font to Times for a serif font
ax.Title.String = 'Step Response';
ax.Title.FontWeight = 'normal';

% Label the axes
xlabel('Time (seconds)')
ylabel('Amplitude')
