import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  ProgressBar,
  Alert,
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Coffee,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

// Audio files for notifications
const NOTIFICATION_SOUNDS = {
  Bell: "bell.wav",
  Chime: "chime.wav",
  Alert: "alert.wav",
};

const PomodoroTimer = () => {
  // Timer state
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("work"); // 'work', 'break', 'longBreak'
  const [cycles, setCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("Bell");
  const [volume, setVolume] = useState(70);
  const [theme, setTheme] = useState("default"); // 'default', 'dark', 'forest', 'ocean'
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const audioRef = useRef(null);

  // Theme colors
  const themes = {
    default: {
      primary: "#dc3545",
      secondary: "#28a745",
      background: "#f8f9fa",
      text: "#343a40",
    },
    dark: {
      primary: "#bb86fc",
      secondary: "#03dac6",
      background: "#121212",
      text: "#e0e0e0",
    },
    forest: {
      primary: "#2e7d32",
      secondary: "#81c784",
      background: "#e8f5e9",
      text: "#1b5e20",
    },
    ocean: {
      primary: "#0277bd",
      secondary: "#4fc3f7",
      background: "#e1f5fe",
      text: "#01579b",
    },
  };

  const currentTheme = themes[theme];

  useEffect(() => {
    let interval = null;

    // Define the function inside the effect
    const handleTimerComplete = () => {
      if (soundEnabled && audioRef.current) {
        audioRef.current.volume = volume / 100;
        audioRef.current
          .play()
          .catch((e) => console.error("Error playing audio:", e));
      }

      if (mode === "work") {
        // Completed work session
        const newCycles = cycles + 1;
        setCycles(newCycles);

        if (newCycles % longBreakInterval === 0) {
          // Time for a long break
          setMode("longBreak");
          setTimeLeft(longBreakTime * 60);
        } else {
          // Regular break
          setMode("break");
          setTimeLeft(breakTime * 60);
        }
      } else {
        // Break is over, back to work
        setMode("work");
        setTimeLeft(workTime * 60);
      }
    };

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [
    isRunning,
    timeLeft,
    mode,
    cycles,
    workTime,
    breakTime,
    longBreakTime,
    longBreakInterval,
    soundEnabled,
    volume,
  ]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setMode("work");
    setTimeLeft(workTime * 60);
    setCycles(0);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalSeconds =
      mode === "work"
        ? workTime * 60
        : mode === "break"
        ? breakTime * 60
        : longBreakTime * 60;

    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Get progress bar variant based on current mode
  const getProgressVariant = () => {
    switch (mode) {
      case "work":
        return "danger";
      case "break":
        return "success";
      case "longBreak":
        return "info";
      default:
        return "danger";
    }
  };

  // Add a new task
  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Filter tasks based on completion status
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);

  return (
    <Container
      className="py-4"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        minHeight: "100vh",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <audio ref={audioRef} src={NOTIFICATION_SOUNDS[selectedSound]} />

      <Row className="justify-content-center mb-4">
        <Col md={8} className="text-center">
          <h1
            className="display-4 mb-0"
            style={{ color: currentTheme.primary }}
          >
            <Clock size={36} className="me-2" />
            Pomodoro Timer
          </h1>
          <p className="lead text-muted">Stay focused and productive</p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card
            className="shadow-sm"
            style={{
              borderColor:
                mode === "work" ? currentTheme.primary : currentTheme.secondary,
              borderWidth: "2px",
            }}
          >
            <Card.Body className="text-center">
              <h2
                className="mb-4"
                style={{
                  color:
                    mode === "work"
                      ? currentTheme.primary
                      : currentTheme.secondary,
                }}
              >
                {mode === "work"
                  ? "Focus Time"
                  : mode === "break"
                  ? "Short Break"
                  : "Long Break"}
              </h2>

              <h1 className="display-1 fw-bold mb-4">{formatTime(timeLeft)}</h1>

              <ProgressBar
                variant={getProgressVariant()}
                now={calculateProgress()}
                className="mb-4"
                style={{ height: "10px" }}
              />

              <div className="d-flex justify-content-center gap-3 mb-3">
                <Button
                  variant={isRunning ? "outline-secondary" : "outline-primary"}
                  size="lg"
                  onClick={toggleTimer}
                  className="rounded-circle"
                  style={{ width: "60px", height: "60px" }}
                >
                  {isRunning ? <Pause size={24} /> : <Play size={24} />}
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={resetTimer}
                  className="rounded-circle"
                  style={{ width: "60px", height: "60px" }}
                >
                  <RotateCcw size={24} />
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => setShowSettings(true)}
                  className="rounded-circle"
                  style={{ width: "60px", height: "60px" }}
                >
                  <Settings size={24} />
                </Button>
              </div>

              <div className="text-muted">
                {cycles} {cycles === 1 ? "cycle" : "cycles"} completed
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Tabs defaultActiveKey="tasks" className="mb-3">
            <Tab
              eventKey="tasks"
              title={
                <>
                  <BookOpen size={18} className="me-1" /> Tasks
                </>
              }
            >
              <Card className="shadow-sm">
                <Card.Body>
                  <Form onSubmit={addTask} className="mb-3">
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Add a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="me-2"
                      />
                      <Button type="submit" variant="primary">
                        Add
                      </Button>
                    </div>
                  </Form>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Your Tasks</h5>
                    <Form.Check
                      type="switch"
                      id="show-completed"
                      label="Show completed"
                      checked={showCompleted}
                      onChange={() => setShowCompleted(!showCompleted)}
                    />
                  </div>

                  {filteredTasks.length === 0 ? (
                    <Alert variant="light" className="text-center">
                      No tasks yet. Add some tasks to get started!
                    </Alert>
                  ) : (
                    <div className="task-list">
                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="d-flex align-items-center p-2 border-bottom"
                        >
                          <Form.Check
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="me-2"
                          />
                          <span
                            style={{
                              textDecoration: task.completed
                                ? "line-through"
                                : "none",
                              opacity: task.completed ? 0.6 : 1,
                              flexGrow: 1,
                            }}
                          >
                            {task.text}
                          </span>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => deleteTask(task.id)}
                          >
                            &times;
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab
              eventKey="stats"
              title={
                <>
                  <CheckCircle size={18} className="me-1" /> Stats
                </>
              }
            >
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <h4>Session Statistics</h4>
                  <div className="d-flex justify-content-around my-4">
                    <div>
                      <h2>{cycles}</h2>
                      <p className="text-muted">Completed Cycles</p>
                    </div>
                    <div>
                      <h2>{Math.floor((cycles * workTime) / 60)}</h2>
                      <p className="text-muted">Hours Focused</p>
                    </div>
                    <div>
                      <h2>{tasks.filter((t) => t.completed).length}</h2>
                      <p className="text-muted">Tasks Completed</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)} centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: currentTheme.background,
            color: currentTheme.text,
            borderBottom: `1px solid ${currentTheme.primary}`,
          }}
        >
          <Modal.Title>
            <Settings size={20} className="me-2" /> Timer Settings
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            backgroundColor: currentTheme.background,
            color: currentTheme.text,
          }}
        >
          <Form>
            <h5 className="mb-3">Timer Duration (minutes)</h5>

            <Form.Group className="mb-3">
              <Form.Label>Work Time</Form.Label>
              <Form.Range
                min={1}
                max={60}
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value))}
                className="mb-2"
              />
              <div className="d-flex justify-content-between">
                <span>1 min</span>
                <span className="fw-bold">{workTime} min</span>
                <span>60 min</span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Short Break Time</Form.Label>
              <Form.Range
                min={1}
                max={30}
                value={breakTime}
                onChange={(e) => setBreakTime(parseInt(e.target.value))}
                className="mb-2"
              />
              <div className="d-flex justify-content-between">
                <span>1 min</span>
                <span className="fw-bold">{breakTime} min</span>
                <span>30 min</span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Long Break Time</Form.Label>
              <Form.Range
                min={5}
                max={60}
                value={longBreakTime}
                onChange={(e) => setLongBreakTime(parseInt(e.target.value))}
                className="mb-2"
              />
              <div className="d-flex justify-content-between">
                <span>5 min</span>
                <span className="fw-bold">{longBreakTime} min</span>
                <span>60 min</span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Long Break Interval (cycles)</Form.Label>
              <Form.Select
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(parseInt(e.target.value))}
              >
                <option value={2}>Every 2 cycles</option>
                <option value={3}>Every 3 cycles</option>
                <option value={4}>Every 4 cycles</option>
                <option value={5}>Every 5 cycles</option>
                <option value={6}>Every 6 cycles</option>
              </Form.Select>
            </Form.Group>

            <hr />

            <h5 className="mb-3">Appearance</h5>

            <Form.Group className="mb-3">
              <Form.Label>Theme</Form.Label>
              <Form.Select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="forest">Forest</option>
                <option value="ocean">Ocean</option>
              </Form.Select>
            </Form.Group>

            <hr />

            <h5 className="mb-3">Sound</h5>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="sound-toggle"
                label={soundEnabled ? "Sound enabled" : "Sound disabled"}
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notification Sound</Form.Label>
              <Form.Select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                disabled={!soundEnabled}
              >
                {Object.keys(NOTIFICATION_SOUNDS).map((sound) => (
                  <option key={sound} value={sound}>
                    {sound}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Volume ({volume}%)</Form.Label>
              <div className="d-flex align-items-center">
                <VolumeX size={16} className="me-2" />
                <Form.Range
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  disabled={!soundEnabled}
                  className="flex-grow-1 mx-2"
                />
                <Volume2 size={16} className="ms-2" />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            backgroundColor: currentTheme.background,
            borderTop: `1px solid ${currentTheme.primary}`,
          }}
        >
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Close
          </Button>
          <Button
            style={{
              backgroundColor: currentTheme.primary,
              borderColor: currentTheme.primary,
            }}
            onClick={() => {
              setShowSettings(false);
              if (mode === "work") {
                setTimeLeft(workTime * 60);
              } else if (mode === "break") {
                setTimeLeft(breakTime * 60);
              } else {
                setTimeLeft(longBreakTime * 60);
              }
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <footer className="text-center mt-4 text-muted">
        <p>
          <Coffee size={16} className="me-1" /> Stay focused and productive with
          the Pomodoro Technique
        </p>
      </footer>
    </Container>
  );
};

export default PomodoroTimer;
