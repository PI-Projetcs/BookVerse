import fs from 'fs';
import path from 'path';

describe('front-end requirements matrix', () => {
	it('keeps the documented RF coverage aligned with the current front-end scope', () => {
		const matrixPath = path.join(__dirname, 'requirements-matrix.md');
		const content = fs.readFileSync(matrixPath, 'utf8');

		expect(content).toContain('RF01');
		expect(content).toContain('RF02');
		expect(content).toContain('RF03');
		expect(content).toContain('RF04');
		expect(content).toContain('RF05');
		expect(content).toContain('RF06');
		expect(content).toContain('RF07');
		expect(content).toContain('RF08');
		expect(content).toContain('RF09');
		expect(content).toContain('RF10');
		expect(content).toContain('RF11');
		expect(content).toContain('RF12');
		expect(content).toContain('RF13');
		expect(content).toContain('RF14');
		expect(content).toContain('RF15');
		expect(content).toContain('Removido');
		expect(content).toContain('Coberto');
		expect(content).toContain('Parcial');
	});
});